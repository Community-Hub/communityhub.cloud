import { test } from "node:test";
import assert from "node:assert/strict";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { BOLD, canonical, hasMarks, isFormatted, ITALIC, plainOf, runsOfMarked, runsOfStored, storedOf, stripInvisible, stripMarks, tagOf, toMarked } from "./marks.ts";
import { createContentIndex } from "./core.ts";
import { checkValue, lengthWarning } from "./validate.ts";
import { fix } from "../jsx/rich.ts";

const MISSION = "Designed to engage, educate, motivate and empower vibrant, sustainable and resilient communities";

test("stored wording reads as pieces and writes back the same", () => {
  assert.deepEqual(runsOfStored("plain"), [{ text: "plain", bold: false, italic: false }]);
  assert.deepEqual(runsOfStored("a <i>b</i> c"), [
    { text: "a ", bold: false, italic: false },
    { text: "b", bold: false, italic: true },
    { text: " c", bold: false, italic: false },
  ]);
  for (const stored of ["plain", `<i>${MISSION}</i>`, "a <b>b</b> c", "<b>one <i>two</i></b> three", "a <i>b</i><b><i>c</i></b> d", "x < y and 3 > 2"]) {
    assert.equal(storedOf(runsOfStored(stored)), stored, stored);
  }
});

test("other spellings of the tags are read as bold and italic, and odd ones are tidied", () => {
  assert.equal(canonical("<STRONG>a</STRONG> <em>b</em>"), "<b>a</b> <i>b</i>");
  assert.equal(canonical("  <i> all of it </i>  "), "<i>all of it</i>");
  assert.equal(canonical("a</b> b"), "a b", "a closing tag with nothing open is dropped");
  assert.equal(canonical("a <i>b"), "a <i>b</i>", "a tag left open runs to the end");
  assert.equal(canonical("a <b></b>b"), "a b", "a tag around nothing is dropped");
  assert.equal(canonical("<i>a</i><i>b</i>"), "<i>ab</i>");
  assert.equal(canonical("  plain  "), "plain");
  assert.equal(canonical("<i>  </i>"), "");
  assert.equal(canonical("<script>alert(1)</script> <u>x</u>"), "<script>alert(1)</script> <u>x</u>", "nothing else in angle brackets means anything");
});

test("what a wording says, and whether it has formatting", () => {
  assert.equal(plainOf(`<i>${MISSION}</i>`), MISSION);
  assert.equal(plainOf("a <b>b</b> <c>"), "a b <c>");
  assert.equal(isFormatted("a <i>b</i>"), true);
  assert.equal(isFormatted("a <i></i>b"), false);
  assert.equal(isFormatted("x < y"), false);
});

test("in the page's content the formatting is invisible marks, and plain text is left exactly as it was", () => {
  assert.equal(toMarked(MISSION), MISSION);
  assert.equal(toMarked("x < y"), "x < y");
  const marked = toMarked(`<i>${MISSION}</i>`);
  assert.equal(marked, `${ITALIC}${MISSION}${ITALIC}`);
  assert.equal(stripMarks(marked), MISSION);
  assert.equal(hasMarks(marked), true);
  assert.equal(hasMarks(MISSION), false);
  assert.deepEqual(runsOfMarked(toMarked("a <b>b <i>c</i></b> d")), runsOfStored("a <b>b <i>c</i></b> d"));
  // The marks are not letters, spaces or anything a search or a trim would act on.
  assert.equal(marked.trim(), marked);
  assert.equal(/\s/.test(ITALIC + BOLD), false);
});

test("the site's own invisible characters are never saved", () => {
  const copiedOffThePage = `${MISSION}${tagOf(5)}`;
  assert.equal(stripInvisible(copiedOffThePage), MISSION);
  assert.equal(checkValue("text", copiedOffThePage, "x"), MISSION);
  assert.equal(checkValue("text", `${ITALIC}a${ITALIC} ${BOLD}b${BOLD}`, "x"), "a b");
  assert.equal(checkValue("alt", `A photo${tagOf(12)}`, "x"), "A photo");
});

test("saving keeps bold and italic, tidies them, and still refuses an empty text", () => {
  assert.equal(checkValue("text", ` <em>${MISSION}</em> `, "x"), `<i>${MISSION}</i>`);
  assert.equal(checkValue("text", "a <b>b</b>", "x"), "a <b>b</b>");
  assert.throws(() => checkValue("text", "<i> </i>", "x"), /cannot be empty/);
  // The length warning counts what is read, not the tags.
  assert.equal(lengthWarning("Pricing", "<b><i>Pricing</i></b>"), null);
  assert.equal(lengthWarning(MISSION, `<i>${MISSION}</i>`), null);
});

test("the content holds marks while the editor's list keeps the stored wording", () => {
  const home = { lede: MISSION, cta: { label: "Learn more", href: "/about" }, hero: { alt: "A street", src: "/a.jpg" } };
  const index = createContentIndex({ roots: [{ name: "home", page: "Home", value: home }] });
  index.apply({ v: { "home.lede": `<i>${MISSION}</i>`, "home.hero.alt": "A <b>street</b>" }, l: {}, h: [] });
  assert.equal(home.lede, `${ITALIC}${MISSION}${ITALIC}`);
  assert.equal(home.hero.alt, "A <b>street</b>", "only text is formatted: a picture description is left as typed");
  assert.equal(index.slot("home.lede")!.def, MISSION);
  index.apply({ v: {}, l: {}, h: [] });
  assert.equal(home.lede, MISSION, "back to the original, with no marks left behind");
});

test("wording written in the code with tags, and items an editor adds to a list, are drawn the same way", () => {
  const page = { title: "The <i>whole</i> town", items: [{ name: "First" }] };
  const index = createContentIndex({
    roots: [{ name: "page", page: "Page", value: page }],
    lists: [{ path: "page.items", label: "Items", page: "Page", itemLabel: (item) => item.name }],
  });
  assert.equal(page.title, `The ${ITALIC}whole${ITALIC} town`);
  assert.equal(index.slot("page.title")!.def, "The <i>whole</i> town");
  index.apply({ v: {}, l: { "page.items": { order: ["d0", "nabcdef1"], added: { nabcdef1: { name: "A <b>new</b> one" } } } }, h: [] });
  assert.equal(page.items[1].name, `A ${BOLD}new${BOLD} one`);
});

test("drawing: marks among an element's children become <strong> and <em>, and attributes are cleaned", () => {
  const draw = (type: string, props: Record<string, unknown>) => renderToStaticMarkup(createElement(type, fix(type, props)));
  assert.equal(draw("p", { children: toMarked(`<i>${MISSION}</i>`) }), `<p><em>${MISSION}</em></p>`);
  assert.equal(draw("p", { children: toMarked("a <b>b <i>c</i></b> d") }), "<p>a <strong>b </strong><strong><em>c</em></strong> d</p>");
  assert.equal(draw("p", { children: ["Fig. 1: ", toMarked("the <b>town</b>"), " (2024)"] }), "<p>Fig. 1: the <strong>town</strong> (2024)</p>");
  assert.equal(draw("button", { "aria-label": toMarked("the <b>town</b>"), title: toMarked("<i>go</i>") }), '<button aria-label="the town" title="go"></button>');
  assert.equal(draw("option", { children: toMarked("the <b>town</b>"), value: toMarked("<i>x</i>") }), '<option value="x">the town</option>');
  // In the editor's browser the wording carries its tag after the formatting, in a piece of its own.
  const tagged = toMarked(`<i>all</i>${tagOf(3)}`);
  assert.equal(draw("p", { children: tagged }), `<p><em>all</em>${tagOf(3)}</p>`);
  // Half a wording (code that cuts a sentence in two) still draws: the style runs to the end of the piece.
  assert.equal(draw("span", { children: toMarked("a <i>b c</i>").slice(0, 5) }), "<span>a <em>b </em></span>");
  // Nothing to do: the very same props come back.
  const plain = { className: "t-lede", children: [MISSION, " ", "more"] };
  assert.equal(fix("p", plain), plain);
  const forComponent = { title: toMarked("<b>x</b>"), children: toMarked("<b>y</b>") };
  const fixed = fix(() => null, forComponent);
  assert.equal(fixed.title, forComponent.title, "a component is handed its wording as it is; it reaches an element later");
  assert.notEqual(fixed.children, forComponent.children);
});
