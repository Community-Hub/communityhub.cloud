import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, mkdir, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { verifyBuiltSite } from '../scripts/verify-build.mjs';
import policy from '../src/content/copy-policy.json' with { type: 'json' };

async function fixture(t, markup, css = '') {
  const directory = await mkdtemp(join(tmpdir(), 'ch-build-guard-'));
  t.after(() => rm(directory, { recursive: true, force: true }));
  await mkdir(join(directory, '_astro'));
  await writeFile(join(directory, 'index.html'), markup);
  await writeFile(join(directory, '_astro', 'site.css'), css);
  return directory;
}

test('rendered shared footer copy is checked after the page template', async t => {
  const directory = await fixture(t, '<main>Community Hub</main><footer>Get started</footer>');
  await assert.rejects(verifyBuiltSite(directory), /get started/i);
});

test('generated CSS cannot bypass the copy policy', async t => {
  const directory = await fixture(t, '<main>Community Hub</main>', '.label::after{content:"Get started"}');
  await assert.rejects(verifyBuiltSite(directory), /CSS generated text/);
});

test('approved live-source labels and punctuation remain available', async t => {
  const directory = await fixture(t, '<main>CommunityHub’s writing — preserved. <a href="products.html">Learn More</a></main>');
  await assert.doesNotReject(verifyBuiltSite(directory));
});

test('valid HTML and ordinary CSS comments pass', async t => {
  const directory = await fixture(t, '<main>Community Hub</main>', '/* comment — not page copy */.label::after{content:"Open"}');
  await assert.doesNotReject(verifyBuiltSite(directory));
});

test('exact original author paragraphs survive the marketing copy guard', async t => {
  const directory = await fixture(t, policy.originalParagraphs.map(p => `<p>${p}</p>`).join(''));
  await assert.doesNotReject(verifyBuiltSite(directory));
});

test('an original paragraph does not permit new claims with banned wording', async t => {
  const directory = await fixture(t, `<p>${policy.originalParagraphs[0]}</p><p>Our robust software.</p>`);
  await assert.rejects(verifyBuiltSite(directory), /robust/);
});
