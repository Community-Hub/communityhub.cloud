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
