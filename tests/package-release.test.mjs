import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, mkdir, readFile, readdir, rm, symlink, writeFile, rename } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawn, spawnSync } from 'node:child_process';
import { createHash } from 'node:crypto';

const script = fileURLToPath(new URL('../scripts/package-release.mjs', import.meta.url));
async function fixture(t) {
  const root = await mkdtemp(join(tmpdir(), 'ch-release-'));
  t.after(() => rm(root, { recursive: true, force: true }));
  const dist = join(root, 'dist');
  await mkdir(join(dist, 'assets'), { recursive: true });
  await mkdir(join(dist, '_astro'));
  await writeFile(join(dist, 'index.html'), '<link rel="stylesheet" href="/_astro/main.css"><img src="assets/photo%20one.jpg"><video src="assets/intro.mp4"></video><a href="about.html#team">About</a><script type="module" src="_astro/main.js"></script>');
  await writeFile(join(dist, 'about.html'), '<a href="https://external.example/missing">External</a>');
  await writeFile(join(dist, 'assets/photo one.jpg'), Buffer.from([0xff, 0xd8, 0x00, 0x42]));
  await writeFile(join(dist, 'assets/intro.mp4'), Buffer.from([0x00, 0x00, 0x66, 0x74, 0x79, 0x70]));
  await writeFile(join(dist, 'assets/unreferenced.png'), 'approved extra image');
  await writeFile(join(dist, '_astro/main.css'), '.cover{background:url("../assets/photo%20one.jpg")}');
  await writeFile(join(dist, '_astro/main.js'), 'import "./chunk.js"; const label = "api_key";');
  await writeFile(join(dist, '_astro/chunk.js'), 'export const ready = true;');
  return { root, dist, output: join(root, 'release') };
}
const args = f => [script, '--dist', f.dist, '--out', f.output];
const run = f => spawnSync(process.execPath, args(f), { encoding: 'utf8' });

test('standalone package includes every media byte and independently verifiable checksums', async t => {
  const f = await fixture(t);
  const result = run(f);
  assert.equal(result.status, 0, result.stderr);
  const manifest = JSON.parse(await readFile(join(f.output, 'release-manifest.json'), 'utf8'));
  assert.equal(manifest.files.length, 8);
  assert.equal(manifest.htmlPages, 2);
  assert.equal(manifest.files.some(file => file.path === 'assets/unreferenced.png'), true);
  for (const file of manifest.files) {
    const original = await readFile(join(f.dist, file.path));
    const packaged = await readFile(join(f.output, 'site', file.path));
    assert.deepEqual(packaged, original);
    assert.equal(file.sha256, createHash('sha256').update(packaged).digest('hex'));
    assert.equal(file.bytes, packaged.length);
  }
  const sums = await readFile(join(f.output, 'SHA256SUMS'), 'utf8');
  const manifestBytes = await readFile(join(f.output, 'release-manifest.json'));
  assert.ok(sums.includes(`${createHash('sha256').update(manifestBytes).digest('hex')}  release-manifest.json\n`));
  assert.ok(sums.includes('  site/assets/photo one.jpg\n'));
});

for (const [name, file, content] of [
  ['HTML media', 'index.html', '<img src="assets/missing.png">'],
  ['responsive image candidate', 'index.html', '<img srcset="assets/photo%20one.jpg 1x,assets/missing.jpg 2x">'],
  ['CSS asset', '_astro/main.css', '.x{background:url(../assets/missing.png)}'],
  ['JavaScript chunk', '_astro/main.js', 'import "./missing.js";'],
  ['minified JavaScript chunk', '_astro/main.js', 'import{ready}from"./missing.js";'],
  ['local SVG reference', 'assets/icon.svg', '<svg><use href="missing.svg#icon"/></svg>'],
  ['redirect target', 'index.html', '<meta http-equiv="refresh" content="0;url=missing.html">'],
]) {
  test(`missing ${name} fails without leaving a release`, async t => {
    const f = await fixture(t);
    await writeFile(join(f.dist, file), content);
    const result = run(f);
    assert.equal(result.status, 1);
    assert.match(result.stderr, /Missing local reference/);
    assert.equal((await readdir(f.root)).includes('release'), false);
  });
}

test('external, inline data and fragment references do not become local file errors', async t => {
  const f = await fixture(t);
  await writeFile(join(f.dist, 'index.html'), '<a href="#x">x</a><img src="data:image/svg+xml;base64,PHN2Zy8+"><img srcset="data:image/png;base64,AAAA 1x, assets/photo%20one.jpg 2x"><iframe data-src="https://service.example/live"></iframe><a href="mailto:team@example.com">Mail</a><link href="https://www.communityhub.cloud/" rel="canonical">');
  assert.equal(run(f).status, 0);
});

test('symlinks cannot import files outside the build', async t => {
  const f = await fixture(t);
  await writeFile(join(f.root, 'outside.txt'), 'outside');
  await symlink(join(f.root, 'outside.txt'), join(f.dist, 'assets/leak.txt'));
  const result = run(f);
  assert.equal(result.status, 1);
  assert.match(result.stderr, /Symlink/);
});

for (const [name, content] of [
  ['.env.production', 'PUBLIC_LABEL=benign'],
  ['assets/credentials.json', '{}'],
  ['_astro/accidental.js', 'const key = "-----BEGIN PRIVATE KEY-----";'],
]) {
  test(`rejects accidental sensitive material ${name} without printing its contents`, async t => {
    const f = await fixture(t);
    await writeFile(join(f.dist, name), content);
    const result = run(f);
    assert.equal(result.status, 1);
    assert.match(result.stderr, /Sensitive/);
    assert.equal(result.stderr.includes(content), false);
  });
}

test('an existing release is never overwritten', async t => {
  const f = await fixture(t);
  await mkdir(f.output);
  await writeFile(join(f.output, 'keep.txt'), 'keep');
  const result = run(f);
  assert.equal(result.status, 1);
  assert.match(result.stderr, /already exists/);
  assert.equal(await readFile(join(f.output, 'keep.txt'), 'utf8'), 'keep');
});

test('an output inside the input build is rejected', async t => {
  const f = await fixture(t);
  f.output = join(f.dist, 'release');
  const result = run(f);
  assert.equal(result.status, 1);
  assert.match(result.stderr, /overlap/);
});

test('rejecting nested output never creates folders inside the build', async t => {
  const f = await fixture(t);
  await symlink(f.dist, join(f.root, 'alias'));
  f.output = join(f.root, 'alias', 'new', 'nested', 'release');
  const result = run(f);
  assert.equal(result.status, 1);
  assert.match(result.stderr, /overlap/);
  assert.equal((await readdir(f.dist)).includes('new'), false);
});

test('JavaScript strings in an HTML script are not treated as CSS assets', async t => {
  const f = await fixture(t);
  await writeFile(join(f.dist, 'index.html'), '<script>const help = "Use url(missing.png) in your stylesheet";</script>');
  assert.equal(run(f).status, 0);
});

test('an incomplete build without an index is rejected', async t => {
  const f = await fixture(t);
  await rm(join(f.dist, 'index.html'));
  const result = run(f);
  assert.equal(result.status, 1);
  assert.match(result.stderr, /index.html/);
});

test('a build changing during packaging is rejected and staging is cleaned', async t => {
  const f = await fixture(t);
  const child = spawn(process.execPath, args(f), { stdio: ['ignore', 'ignore', 'pipe'] });
  let stderr = '';
  child.stderr.on('data', data => { stderr += data; });
  let n = 0;
  let stopped = false;
  const writer = (async () => {
    while (!stopped) {
      const temporary = join(f.root, 'changing.html');
      await writeFile(temporary, `<p>${n++}</p>`);
      await rename(temporary, join(f.dist, 'index.html'));
      await new Promise(resolve => setTimeout(resolve, 2));
    }
  })();
  const code = await new Promise(resolve => child.on('close', resolve));
  stopped = true;
  await writer;
  assert.equal(code, 1);
  assert.match(stderr, /Build changed/);
  assert.equal((await readdir(f.root)).some(name => name.startsWith('.ch-release-') || name === 'release'), false);
});
