import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile, readdir } from 'node:fs/promises';
import { createHash } from 'node:crypto';

const dist = new URL('../dist/', import.meta.url);
const manifestURL = new URL('./deployment/reference-manifest.json', import.meta.url);

test('complete build matches Kwaku’s approved deployed reference byte-for-byte', async () => {
  const manifest = JSON.parse(await readFile(manifestURL, 'utf8'));
  const actual = [];
  async function walk(prefix = '') {
    for (const item of await readdir(new URL(prefix, dist), {withFileTypes:true})) {
      const path = prefix + item.name;
      if (item.isDirectory()) await walk(path + '/'); else actual.push(path);
    }
  }
  await walk();
  assert.deepEqual(actual.sort(), manifest.files.map(file => file.path).sort(), 'Generated file inventory changed');
  for (const file of manifest.files) {
    const bytes = await readFile(new URL(file.path, dist));
    assert.equal(createHash('sha256').update(bytes).digest('hex'), file.sha256, file.path);
  }
});
