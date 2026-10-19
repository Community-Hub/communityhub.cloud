import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { createContentIndex, sectionKey } from "./core.ts";
import { createCmsService } from "./service.ts";
import { checkValue, CmsError, lengthWarning } from "./validate.ts";
import { checkImage, ImageRejected, MAX_IMAGE_BYTES, sniffImage } from "./image.ts";
import { testSql, type TestDbControl } from "./test-db.ts";

const fresh = () => ({
  title: "Welcome home",
  contactEmail: "hello@example.org",
  link: { href: "/pricing", label: "See pricing" },
  frames: [
    { caption: "First", img: { src: "/a.jpg", alt: "A picture" } },
    { caption: "Second", img: { src: "/b.png", alt: "B picture" } },
    { caption: "Third", img: { src: "/c.webp", alt: "C picture" } },
  ],
  filter: "all",
});

async function setup() {
  const content = fresh();
  const index = createContentIndex({
    roots: [{ name: "c", page: "Home", value: content }],
    lists: [{ path: "c.frames", label: "Frames", page: "Home", itemLabel: (f: any) => f.caption }],
    sections: [{ path: "/", id: "intro", label: "Intro", page: "Home" }],
  });
  const svc = createCmsService({ sql: await testSql(), index });
  return { content, index, svc };
}

describe("slot discovery", () => {
  it("derives stable keys and kinds from the content object", async () => {
    const { index } = await setup();
    const kinds = Object.fromEntries(index.slots.map((s) => [s.key, s.kind]));
    assert.equal(kinds["c.title"], "text");
    assert.equal(kinds["c.contactEmail"], "email");
    assert.equal(kinds["c.link.href"], "link");
    assert.equal(kinds["c.frames.1.img.src"], "image");
    assert.equal(kinds["c.frames.1.img.alt"], "alt");
    assert.equal(kinds["c.filter"], undefined, "identifiers are not editable");
    assert.equal(index.slot("c.frames.1.img.src")?.altKey, "c.frames.1.img.alt");
  });
});

describe("merge", () => {
  it("applies overrides in place and restores defaults when removed", async () => {
    const { content, svc } = await setup();
    await svc.saveSlot("c.title", "Hello there", "a@x.test");
    await svc.state();
    assert.equal(content.title, "Hello there");
    await svc.reset("c.title", "a@x.test");
    svc.invalidate();
    await svc.state();
    assert.equal(content.title, "Welcome home");
  });

  it("ignores stored keys the code no longer has", async () => {
    const { content, svc } = await setup();
    await svc.store.write({ key: "c.gone", value: "x" }, "a@x.test");
    await svc.state();
    assert.equal(content.title, "Welcome home");
  });

  it("reorders, removes and adds list items, and restores them", async () => {
    const { content, svc } = await setup();
    await svc.saveList("c.frames", {
      order: ["d2", "d0", "nabcdef12"],
      added: { nabcdef12: { caption: "Brand new", img: { src: "/a.jpg", alt: "Fresh" }, evil: "x" } },
    }, "a@x.test");
    await svc.state();
    assert.deepEqual(content.frames.map((f) => f.caption), ["Third", "First", "Brand new"]);
    assert.equal((content.frames[2] as any).evil, undefined, "unknown fields are dropped");
    await svc.saveList("c.frames", { order: ["d0", "d1", "d2"], added: {} }, "a@x.test");
    await svc.state();
    assert.deepEqual(content.frames.map((f) => f.caption), ["First", "Second", "Third"]);
  });

  it("edits to a moved item stay with the item", async () => {
    const { content, svc } = await setup();
    await svc.saveList("c.frames", { order: ["d2", "d1", "d0"], added: {} }, "a@x.test");
    await svc.saveSlot("c.frames.0.caption", "Renamed first", "a@x.test");
    await svc.state();
    assert.deepEqual(content.frames.map((f) => f.caption), ["Third", "Second", "Renamed first"]);
  });

  it("hides and shows a section", async () => {
    const { index, svc } = await setup();
    await svc.setSection("/", "intro", true, "a@x.test");
    await svc.state();
    assert.equal(index.isHidden("/", "intro"), true);
    await svc.setSection("/", "intro", false, "a@x.test");
    svc.invalidate();
    await svc.state();
    assert.equal(index.isHidden("/", "intro"), false);
  });
});

describe("validation", () => {
  it("rejects bad links, emails, controls and empty text", () => {
    assert.throws(() => checkValue("link", "javascript:alert(1)"), CmsError);
    assert.throws(() => checkValue("link", "//evil.test"), CmsError);
    assert.throws(() => checkValue("link", "data:text/html,x"), CmsError);
    assert.equal(checkValue("link", " /pricing "), "/pricing");
    assert.equal(checkValue("link", "mailto:a@b.org"), "mailto:a@b.org");
    assert.throws(() => checkValue("email", "not an email"), CmsError);
    assert.throws(() => checkValue("text", "bad\u0000text"), CmsError);
    assert.throws(() => checkValue("text", "   "), CmsError);
    assert.throws(() => checkValue("image", "https://evil.test/x.png", "/a.jpg"), CmsError);
    assert.equal(checkValue("image", "/cms-media/abc-123.png", "/a.jpg"), "/cms-media/abc-123.png");
  });

  it("stores markup as plain text; it is never interpreted", () => {
    assert.equal(checkValue("text", "<b>hi</b> & <script>x</script>"), "<b>hi</b> & <script>x</script>");
  });

  it("warns when text is much longer than the default", () => {
    assert.equal(lengthWarning("Short title", "Short title!"), null);
    assert.match(lengthWarning("Short title", "x".repeat(200))!, /characters/);
  });

  it("requires alt text with a new picture", async () => {
    const { svc } = await setup();
    await assert.rejects(svc.saveImage("c.frames.0.img.src", "/cms-media/abc-123.png", "  ", "a@x.test"), CmsError);
    await svc.saveImage("c.frames.0.img.src", "/cms-media/abc-123.png", "A new view", "a@x.test");
    const o = await svc.overview();
    assert.equal(o.slots.find((s) => s.key === "c.frames.0.img.alt")!.value, "A new view");
  });

  it("rejects list shapes that break the rules", async () => {
    const { svc } = await setup();
    await assert.rejects(svc.saveList("c.frames", { order: [], added: {} }, "a@x.test"), CmsError);
    await assert.rejects(svc.saveList("c.frames", { order: ["d0", "d0"], added: {} }, "a@x.test"), CmsError);
    await assert.rejects(svc.saveList("c.frames", { order: ["d9"], added: {} }, "a@x.test"), CmsError);
    await assert.rejects(svc.saveList("c.frames", { order: ["nabcdef12"], added: {} }, "a@x.test"), CmsError);
    await assert.rejects(
      svc.saveList("c.frames", { order: ["nabcdef12"], added: { nabcdef12: { caption: "x", img: { src: "https://evil.test/p.png", alt: "x" } } } }, "a@x.test"),
      CmsError,
    );
  });
});

describe("revision history", () => {
  it("records who, what, when, old and new, and reverts to any revision", async () => {
    const { content, svc } = await setup();
    await svc.saveSlot("c.title", "One", "maddie@x.test");
    await svc.saveSlot("c.title", "Two", "john@x.test");
    await svc.saveSlot("c.title", "Three", "maddie@x.test");
    const h = await svc.history("c.title");
    assert.equal(h.length, 3);
    assert.deepEqual(h.map((r) => [r.actor_email, r.old_value, r.new_value]), [
      ["maddie@x.test", "Two", "Three"],
      ["john@x.test", "One", "Two"],
      ["maddie@x.test", null, "One"],
    ]);
    assert.ok(h[0].created_at);
    await svc.revert(h[1].id, "john@x.test"); // back to "Two"
    await svc.state();
    assert.equal(content.title, "Two");
    const after = await svc.history("c.title");
    assert.equal(after[0].action, "revert");
    assert.equal(after[0].reverted_from, h[1].id);
    await svc.reset("c.title", "john@x.test");
    svc.invalidate();
    await svc.state();
    assert.equal(content.title, "Welcome home");
    assert.equal((await svc.history("c.title"))[0].action, "reset");
  });

  it("does not record a revision when nothing changed", async () => {
    const { svc } = await setup();
    await svc.saveSlot("c.title", "Same", "a@x.test");
    await svc.saveSlot("c.title", "Same", "a@x.test");
    await svc.saveSlot("c.title", "Welcome home", "a@x.test"); // equals the default: clears the override
    assert.equal((await svc.history("c.title")).length, 2);
  });

  it("reverts a picture and its alt text together", async () => {
    const { content, svc } = await setup();
    await svc.saveImage("c.frames.0.img.src", "/cms-media/aaa-111.jpg.webp", "First new", "a@x.test");
    await svc.saveImage("c.frames.0.img.src", "/cms-media/bbb-222.jpg.webp", "Second new", "a@x.test");
    const h = await svc.history("c.frames.0.img.src");
    await svc.revert(h[1].id, "a@x.test");
    await svc.state();
    assert.equal(content.frames[0].img.src, "/cms-media/aaa-111.jpg.webp");
    assert.equal(content.frames[0].img.alt, "First new");
    await svc.reset("c.frames.0.img.src", "a@x.test");
    svc.invalidate();
    await svc.state();
    assert.equal(content.frames[0].img.src, "/a.jpg");
    assert.equal(content.frames[0].img.alt, "A picture");
  });
});

describe("images", () => {
  const png = Uint8Array.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0, 0, 0, 0]);
  it("accepts jpg, png and webp by content and rejects the rest", () => {
    assert.equal(checkImage(png), "png");
    assert.equal(sniffImage(Uint8Array.from([0xff, 0xd8, 0xff, 0xe0])), "jpg");
    assert.equal(sniffImage(Uint8Array.from([0x52, 0x49, 0x46, 0x46, 1, 2, 3, 4, 0x57, 0x45, 0x42, 0x50])), "webp");
    const svg = new TextEncoder().encode('<svg xmlns="http://www.w3.org/2000/svg"></svg>');
    assert.throws(() => checkImage(svg), ImageRejected);
    assert.throws(() => checkImage(new TextEncoder().encode("GIF89a....")), ImageRejected);
    assert.throws(() => checkImage(new Uint8Array(0)), ImageRejected);
    const big = new Uint8Array(MAX_IMAGE_BYTES + 1);
    big.set(png);
    assert.throws(() => checkImage(big), /limit/);
  });
});

void sectionKey;

/** A second build of the site, with the same edits in the database but different default content. */
const siteWith = (frames: { id?: string; caption: string }[], sql: Awaited<ReturnType<typeof testSql>>) => {
  const content = { frames: frames.map((f) => ({ ...f })) };
  const index = createContentIndex({
    roots: [{ name: "c", page: "Home", value: content }],
    lists: [{ path: "c.frames", label: "Frames", page: "Home", itemLabel: (f: any) => f.caption }],
  });
  return { content, index, svc: createCmsService({ sql, index }) };
};

describe("code changes after edits", () => {
  it("a default inserted ahead of edited items does not move the edits onto the wrong item", async () => {
    const sql = await testSql();
    const v1 = siteWith([{ caption: "First" }, { caption: "Second" }, { caption: "Third" }], sql);
    await v1.svc.saveSlot("c.frames.1.caption", "Second, edited", "a@x.org");
    await v1.svc.state();
    assert.equal(v1.content.frames[1].caption, "Second, edited");

    // New build: a new first item pushes the others down.
    const v2 = siteWith([{ caption: "Brand new" }, { caption: "First" }, { caption: "Second" }, { caption: "Third" }], sql);
    await v2.svc.state();
    assert.deepEqual(v2.content.frames.map((f) => f.caption), ["Brand new", "First", "Second", "Third"]);
    const ov = await v2.svc.overview();
    assert.equal(ov.slots.find((s) => s.key === "c.frames.1.caption")?.stale, true);
    // Saving again clears the flag and applies to the item now at that position.
    await v2.svc.saveSlot("c.frames.2.caption", "Second, edited again", "a@x.org");
    assert.equal((await v2.svc.overview()).slots.find((s) => s.key === "c.frames.2.caption")?.stale, undefined);
  });

  it("list order follows items by id when the code list changes, and goes stale when it cannot", async () => {
    const sql = await testSql();
    const v1 = siteWith([{ id: "a", caption: "A" }, { id: "b", caption: "B" }, { id: "c", caption: "C" }], sql);
    await v1.svc.saveList("c.frames", { order: ["d2", "d0", "d1"], added: {} }, "a@x.org");
    // Same items, different code order: the editors' order still means C, A, B.
    const v2 = siteWith([{ id: "b", caption: "B" }, { id: "c", caption: "C" }, { id: "a", caption: "A" }], sql);
    await v2.svc.state();
    assert.deepEqual(v2.content.frames.map((f) => f.id), ["c", "a", "b"]);
    // An item was added in code: the saved order cannot be followed safely, so the code list shows and it is flagged.
    const v3 = siteWith([{ id: "a", caption: "A" }, { id: "n", caption: "N" }, { id: "b", caption: "B" }, { id: "c", caption: "C" }], sql);
    await v3.svc.state();
    assert.deepEqual(v3.content.frames.map((f) => f.id), ["a", "n", "b", "c"]);
    assert.equal((await v3.svc.overview()).lists[0].stale, true);
  });

  it("editing a field and then reordering the list (no ids) does not make the list stale", async () => {
    const sql = await testSql();
    const defaults = () => [{ caption: "Q one" }, { caption: "Q two" }, { caption: "Q three" }];
    const v1 = siteWith(defaults(), sql);
    await v1.svc.saveSlot("c.frames.1.caption", "Q two, edited", "a@x.org");
    await v1.svc.state(); // the edit is now applied to the live default objects
    await v1.svc.saveList("c.frames", { order: ["d2", "d0", "d1"], added: {} }, "a@x.org");
    await v1.svc.saveSlot("c.frames.0.caption", "Q one, edited", "a@x.org"); // a field edit after the reorder
    await v1.svc.state();
    const v2 = siteWith(defaults(), sql); // a fresh instance (a new server process)
    await v2.svc.state();
    assert.deepEqual(v2.content.frames.map((f) => f.caption), ["Q three", "Q one, edited", "Q two, edited"]);
    const ov = await v2.svc.overview();
    assert.equal(ov.lists[0].stale, undefined);
  });

  it("reverting a list keeps the identities it was saved against, so an old order is flagged, not applied by position", async () => {
    const sql = await testSql();
    const v1 = siteWith([{ caption: "A" }, { caption: "B" }, { caption: "C" }], sql);
    await v1.svc.saveList("c.frames", { order: ["d2", "d1", "d0"], added: {} }, "a@x.org");
    await v1.svc.saveList("c.frames", { order: ["d0", "d1", "d2"], added: {} }, "a@x.org"); // back to the code order
    // The code list changes (an item is inserted), then someone reverts to the reversed order.
    const v2 = siteWith([{ caption: "New" }, { caption: "A" }, { caption: "B" }, { caption: "C" }], sql);
    const first = (await v2.svc.history("list:c.frames")).find((r) => r.new_value?.includes("d2"))!;
    await v2.svc.revert(first.id, "a@x.org");
    await v2.svc.state();
    assert.deepEqual(v2.content.frames.map((f) => f.caption), ["New", "A", "B", "C"]);
    assert.equal((await v2.svc.overview()).lists[0].stale, true);
  });

  it("edits saved before fingerprints existed keep applying", async () => {
    const sql = await testSql();
    const v1 = siteWith([{ caption: "First" }], sql);
    await sql.query("insert into cms_content (key, value, updated_by) values ('c.frames.0.caption', 'Old edit', 'a@x.org')");
    await v1.svc.state();
    assert.equal(v1.content.frames[0].caption, "Old edit");
  });
});

describe("database trouble", () => {
  it("serves the last good state when the database goes down, never throws", async () => {
    const control: TestDbControl = { down: false, delayMs: 0 };
    const sql = await testSql(control);
    const site = siteWith([{ caption: "First" }], sql);
    await site.svc.saveSlot("c.frames.0.caption", "Edited", "a@x.org");
    const good = await site.svc.publicState(500);
    assert.equal(good.v["c.frames.0.caption"], "Edited");
    control.down = true;
    site.svc.invalidate();
    const during = await site.svc.publicState(500);
    assert.deepEqual(during, good); // matches what the server's shared content holds, so the browser hydrates cleanly
    assert.equal(site.content.frames[0].caption, "Edited");
  });

  it("gives up on a slow database after the timeout and uses the last good state", async () => {
    const control: TestDbControl = { down: false, delayMs: 0 };
    const sql = await testSql(control);
    const site = siteWith([{ caption: "First" }], sql);
    await site.svc.saveSlot("c.frames.0.caption", "Edited", "a@x.org");
    const good = await site.svc.publicState(500);
    control.delayMs = 400;
    site.svc.invalidate();
    const t0 = Date.now();
    const slow = await site.svc.publicState(50);
    assert.ok(Date.now() - t0 < 300);
    assert.deepEqual(slow, good);
  });

  it("with no good state yet, falls back to the built-in text", async () => {
    const control: TestDbControl = { down: true, delayMs: 0 };
    const site = siteWith([{ caption: "First" }], await testSql(control));
    assert.deepEqual(await site.svc.publicState(200), { v: {}, l: {}, h: [] });
  });

  it("a multi-key save is all or nothing", async () => {
    const { svc } = await setup();
    await assert.rejects(
      svc.store.writeMany([{ key: "c.title", value: "Half saved" }, { key: null as unknown as string, value: "boom" }], "a@x.org", "edit", "batch1"),
    );
    assert.equal(await svc.store.getValue("c.title"), null);
    assert.equal((await svc.store.history(null)).length, 0);
    await svc.saveImage("c.frames.0.img.src", "/cms-media/x.png", "New alt", "a@x.org");
    const st = await svc.state();
    assert.equal(st.v["c.frames.0.img.src"], "/cms-media/x.png");
    assert.equal(st.v["c.frames.0.img.alt"], "New alt");
  });
});
