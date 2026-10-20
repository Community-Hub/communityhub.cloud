import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile, readdir } from 'node:fs/promises';

const root = new URL('../../', import.meta.url);
const base = process.env.WEBSITE_RUNTIME_URL;
if (!base) throw new Error('Set WEBSITE_RUNTIME_URL to the running static container URL.');
const request = (path, options = {}) => fetch(new URL(path, base), { redirect: 'manual', ...options });
const redirects = JSON.parse(await readFile(new URL('deployment/legacy-redirects.json', root), 'utf8'));

test('every generated HTML page is served by the static container', async () => {
  const pages = (await readdir(new URL('dist/', root))).filter(name => name.endsWith('.html'));
  assert.equal(pages.length, 38);
  for (const page of pages) {
    const response = await request('/' + page);
    assert.equal(response.status, 200, page);
    assert.match(response.headers.get('content-type'), /text\/html/);
    await response.arrayBuffer();
  }
});

test('legacy routes redirect both slash forms and preserve query strings', async () => {
  for (const [source, destination] of Object.entries(redirects)) {
    for (const suffix of ['', '/']) {
      const response = await request(source + suffix + '?utm_source=migration&ref=old');
      assert.equal(response.status, 301, source + suffix);
      const location = new URL(response.headers.get('location'), base);
      assert.equal(location.pathname, destination);
      assert.equal(location.search, '?utm_source=migration&ref=old');
      const target = await request(destination);
      assert.equal(target.status, 200, destination);
      await target.arrayBuffer();
    }
  }
});

test('unknown routes use the supplied error page with status 404 and no-store', async () => {
  const expected = await (await request('/404.html')).text();
  for (const path of ['/not-a-page', '/assets/missing.png', '/sample-page/', '/hello-world/']) {
    const response = await request(path);
    assert.equal(response.status, 404, path);
    assert.equal(await response.text(), expected);
    assert.match(response.headers.get('cache-control'), /no-store/);
  }
});

test('health and HTML cache policy remain appropriate for the container', async () => {
  const health = await request('/healthz');
  assert.equal(health.status, 200);
  assert.match(health.headers.get('content-type'), /text\/plain/);
  assert.equal(await health.text(), 'ok\n');
  const home = await request('/');
  assert.equal(home.status, 200);
  assert.match(home.headers.get('cache-control'), /no-cache/);
  await home.arrayBuffer();
  const asset = (await readdir(new URL('dist/_astro/', root))).find(name => name.endsWith('.js'));
  assert.ok(asset);
  const response = await request('/_astro/' + asset);
  assert.equal(response.status, 200);
  assert.match(response.headers.get('cache-control'), /max-age=31536000, immutable/);
  await response.arrayBuffer();
});
import { createHash } from 'node:crypto';

test('served build bytes match the deployed reference across every file', async () => {
  const manifest = JSON.parse(await readFile(new URL('tests/deployment/reference-manifest.json', root), 'utf8'));
  let cursor = 0;
  await Promise.all(Array.from({length: 8}, async () => {
    while (cursor < manifest.files.length) {
      const file = manifest.files[cursor++];
      const response = await request('/' + file.path);
      assert.equal(response.status, 200, file.path);
      const bytes = Buffer.from(await response.arrayBuffer());
      assert.equal(createHash('sha256').update(bytes).digest('hex'), file.sha256, file.path);
    }
  }));
});
