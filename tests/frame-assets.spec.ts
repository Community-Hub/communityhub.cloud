import { expect, test } from "@playwright/test";
import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";

/** Every picture a frame, slide or route names (/assets/... or /media/...) exists in public/. */
function files(dir: string): string[] {
  return readdirSync(dir).flatMap((name) => {
    const path = join(dir, name);
    return statSync(path).isDirectory() ? files(path) : [path];
  });
}

test("every asset path named in src exists on disk", () => {
  const missing: string[] = [];
  const seen = new Set<string>();
  for (const file of files("src").filter((f) => /\.(tsx?|json)$/.test(f))) {
    const text = readFileSync(file, "utf8");
    for (const m of text.matchAll(/["'`](\/(?:assets|media)\/[A-Za-z0-9_\-./]+\.(?:jpe?g|png|webp|svg|gif|mp4))["'`]/g)) {
      const src = m[1];
      if (seen.has(src)) continue;
      seen.add(src);
      if (!existsSync(join("public", src))) missing.push(`${src} (in ${file})`);
    }
  }
  expect(seen.size).toBeGreaterThan(50);
  expect(missing).toEqual([]);
});

test("frames with a src also carry alt text", () => {
  const bad: string[] = [];
  for (const file of ["src/lib/content.ts", "src/lib/product-pages.ts", "src/lib/who.ts"]) {
    const text = readFileSync(file, "utf8");
    for (const m of text.matchAll(/src: "\/assets\/[^"]+",([\s\S]{0,220}?)\n\s*\}/g)) {
      if (!/alt:/.test(m[1]) && !/alt:/.test(text.slice(Math.max(0, m.index! - 300), m.index!))) bad.push(`${file}: ${m[0].slice(0, 60)}`);
    }
  }
  expect(bad).toEqual([]);
});

/** Intrinsic pixel size read from a PNG/JPEG header (independent of any recorded data). */
function actualSize(path: string): { width: number; height: number } | null {
  const buf = readFileSync(path).subarray(0, 262144);
  if (buf.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]))) {
    return { width: buf.readUInt32BE(16), height: buf.readUInt32BE(20) };
  }
  if (buf[0] === 0xff && buf[1] === 0xd8) {
    let i = 2;
    while (i < buf.length - 1) {
      if (buf[i] !== 0xff) { i += 1; continue; }
      const marker = buf[i + 1];
      if (marker === 0xc0 || marker === 0xc1 || marker === 0xc2) return { width: buf.readUInt16BE(i + 7), height: buf.readUInt16BE(i + 5) };
      if (marker === 0xd8 || marker === 0xd9 || (marker >= 0xd0 && marker <= 0xd7)) { i += 2; continue; }
      i += 2 + buf.readUInt16BE(i + 2);
    }
  }
  return null;
}

test("recorded image dimensions match the actual photo files", () => {
  const recorded = JSON.parse(readFileSync("src/lib/image-dimensions.json", "utf8")) as Record<string, { width: number; height: number }>;
  const stale: string[] = [];
  for (const [src, size] of Object.entries(recorded)) {
    const path = join("public", src);
    if (!existsSync(path)) { stale.push(`${src}: recorded but missing on disk`); continue; }
    const actual = actualSize(path);
    if (!actual || actual.width !== size.width || actual.height !== size.height) {
      stale.push(`${src}: recorded ${size.width}x${size.height}, actual ${actual ? `${actual.width}x${actual.height}` : "unreadable"}`);
    }
  }
  expect(Object.keys(recorded).length).toBeGreaterThan(50);
  expect(stale).toEqual([]);
  // The two photos behind the original stale-dimensions finding, pinned to their verified files.
  expect(recorded["/assets/hotel-oberlin-sign.jpg"]).toEqual(actualSize(join("public", "assets/hotel-oberlin-sign.jpg")));
  expect(recorded["/assets/live-home-story-03.png"]).toEqual(actualSize(join("public", "assets/live-home-story-03.png")));
});
