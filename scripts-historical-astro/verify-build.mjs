import { readdir, readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import policy from '../src/content/copy-policy.json' with { type: 'json' };

/** Validate final component output, including shared chrome and generated CSS. */
export async function verifyBuiltSite(directory) {
  const root = directory instanceof URL ? fileURLToPath(directory) : directory;
  const files = await readdir(root, { recursive: true });
  for (const name of files) {
    if (!name.endsWith('.html') && !name.endsWith('.css')) continue;
    const source = await readFile(join(root, name), 'utf8');
    if (name.endsWith('.html')) {
      // Exact author paragraphs remain authoritative even when they contain a
      // word the policy excludes from newly written marketing copy.
      let candidate = source;
      for (const paragraph of policy.originalParagraphs) {
        candidate = candidate.replaceAll(paragraph, '');
      }
      const lower = candidate.toLowerCase();
      const term = [...policy.dashes, ...policy.phrases].find(term => lower.includes(term));
      if (term) throw new Error(`Disallowed copy ${JSON.stringify(term)} in rendered ${name}`);
    } else {
      for (const match of source.matchAll(/\bcontent\s*:\s*("(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*')/g)) {
        const text = match[1].replace(/\\([0-9a-f]{1,6})\s?/gi, (_, hex) => String.fromCodePoint(parseInt(hex, 16)));
        const term = [...policy.dashes, ...policy.phrases].find(term => text.toLowerCase().includes(term));
        if (term) throw new Error(`Disallowed copy ${JSON.stringify(term)} in CSS generated text: ${name}`);
      }
    }
  }
}
