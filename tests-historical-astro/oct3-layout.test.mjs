import { test } from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';

const built = existsSync('dist/digital-signage.html');
const page = built ? readFileSync('dist/digital-signage.html', 'utf8') : '';
const opts = { skip: built ? false : 'run npm run build first' };

test('digital signage page covers what plays, management, controllers and locations', opts, () => {
  const ids = [...page.matchAll(/<section[^>]*\bid="([a-z-]+)"/g)].map(m => m[1]);
  for (const id of ['shows', 'multileveled', 'loop', 'managed', 'controller', 'examples', 'locations', 'campus'])
    assert.ok(ids.includes(id), `section ${id}`);
  for (const id of ['shows', 'managed', 'examples', 'campus'])
    assert.ok(page.includes(`href="#${id}"`), `jump link to ${id}`);
});

test('digital signage lists the real screens in one phone scene', opts, () => {
  assert.match(page, /<ul class="ds-shows-list" data-story-scene>/);
  assert.doesNotMatch(page, /<li data-story-scene><a href="[a-z-]+\.html"><img/);
});

test('steppers put the text list before the media (text left, image right)', opts, () => {
  const lists = [...page.matchAll(/<ol class="zpb-steps/g)].map(m => m.index);
  const media = [...page.matchAll(/<figure class="zpb-stepper-media/g)].map(m => m.index);
  assert.equal(lists.length, media.length);
  lists.forEach((at, i) => assert.ok(at < media[i], `stepper ${i}: list before media`));
});

test('phone app evidence puts its copy before its media', () => {
  const src = readFileSync('src/content/products-b.ts', 'utf8');
  const at = src.indexOf('class="product-evidence"');
  assert.ok(at > 0);
  const row = src.slice(at, at + 4000);
  assert.ok(row.indexOf('product-evidence-copy') < row.indexOf('product-evidence-media'));
});

test('the oct3 layout sheet is imported last-but-scroll and flips copy left', () => {
  const idx = readFileSync('src/styles/index.css', 'utf8');
  assert.ok(idx.includes('@import "./oct3_layout.css"'));
  const css = readFileSync('src/styles/oct3_layout.css', 'utf8');
  assert.match(css, /#engage \.eng-copy \{ grid-column:1;/);
  assert.match(css, /#engage \.eng-media \{ grid-column:2;/);
});
