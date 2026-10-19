import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import ts from 'typescript';

const source = readFileSync('src/scripts/ui/fresh-document-url.ts', 'utf8');
const code = ts.transpileModule(source, {compilerOptions:{target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.ES2022}}).outputText;
const {freshDocumentUrl} = await import(`data:text/javascript;base64,${Buffer.from(code).toString('base64')}`);

test('fresh dashboard documents retain their selected page, filters and fragment', () => {
  const original = 'https://oberlin.communityhub.cloud/dh-public/city-of-oberlin?active-page=exploreData&active-data-dashboard=1001&tag=a&tag=b#details';
  const result = new URL(freshDocumentUrl(original, 1234));
  assert.equal(result.origin, 'https://oberlin.communityhub.cloud');
  assert.equal(result.pathname, '/dh-public/city-of-oberlin');
  assert.equal(result.searchParams.get('active-page'), 'exploreData');
  assert.equal(result.searchParams.get('active-data-dashboard'), '1001');
  assert.deepEqual(result.searchParams.getAll('tag'), ['a', 'b']);
  assert.equal(result.hash, '#details');
  assert.equal(result.searchParams.get('_ch_embed_refresh'), '1234');
  assert.equal(new URL(original).searchParams.has('_ch_embed_refresh'), false);
});

test('only the known dashboard document family is refreshed', () => {
  for (const url of [
    'https://example.org/dh-public/dashboard',
    'https://communityhub.cloud.example.org/dh-public/dashboard',
    'https://notcommunityhub.cloud/dh-public/dashboard',
    'https://oberlin.communityhub.cloud/calendar/?embed=1',
    'https://oberlin.communityhub.cloud/fe/api/data-hub-v2/visualizations/1001',
    'https://oberlin.communityhub.cloud/dh-publicity',
    'http://oberlin.communityhub.cloud/dh-public/dashboard',
    '/dh-public/dashboard', '',
  ]) assert.equal(freshDocumentUrl(url, 1234), url);
  assert.equal(new URL(freshDocumentUrl('https://cleveland.communityhub.cloud/dh-public/glsc-embed', 1234)).searchParams.get('_ch_embed_refresh'), '1234');
});

test('an explicit reload replaces the refresh key instead of accumulating it', () => {
  const initial = freshDocumentUrl('https://oberlin.communityhub.cloud/dh-public/ops-embed?orgId=2', 100);
  const retried = new URL(freshDocumentUrl(initial, 200));
  assert.deepEqual(retried.searchParams.getAll('_ch_embed_refresh'), ['200']);
  assert.equal(retried.searchParams.get('orgId'), '2');
});
