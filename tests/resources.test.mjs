import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
const source = await readFile('src/content/resources.ts', 'utf8');
test('hidden video poster images are not lazy-loaded', () => {
  const tags = source.match(/<img[^>]*data-video-poster[^>]*>/g) ?? [];
  assert.ok(tags.length > 0);
  for (const tag of tags) assert.ok(!/loading="lazy"/.test(tag), tag);
});
