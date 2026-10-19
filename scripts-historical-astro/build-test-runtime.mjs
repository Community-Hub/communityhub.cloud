/** Bundle checked TypeScript modules for isolated browser fixtures.
 * This output is test-only; the production site uses Astro's normal asset graph.
 */
import { copyFile, mkdir, readFile, readdir, writeFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { build } from 'vite';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const scripts = join(root, 'src', 'scripts');
const styles = join(root, 'src', 'styles');
const output = join(root, 'tests', 'runtime');
await mkdir(output, { recursive: true });

const entries = (await readdir(scripts))
  .filter((name) => name.endsWith('.ts') && name !== 'index.ts' && !name.endsWith('.d.ts'))
  .sort();
const manifest = { scripts: [], styles: [] };
const sha256 = async (path) => createHash('sha256').update(await readFile(path)).digest('hex');

for (const entry of entries) {
  const stem = entry.slice(0, -3);
  await build({
    root,
    configFile: false,
    logLevel: 'error',
    publicDir: false,
    build: {
      outDir: output,
      emptyOutDir: false,
      minify: false,
      target: 'es2022',
      sourcemap: 'inline',
      lib: {
        entry: join(scripts, entry),
        name: `CommunityHubFixture_${stem}`,
        formats: ['iife'],
        fileName: () => `${stem}.js`,
      },
    },
  });
  manifest.scripts.push({
    source: `src/scripts/${entry}`,
    sourceSha256: await sha256(join(scripts, entry)),
    output: `${stem}.js`,
    outputSha256: await sha256(join(output, `${stem}.js`)),
  });
}

for (const entry of (await readdir(styles)).filter((name) => name.endsWith('.css')).sort()) {
  await copyFile(join(styles, entry), join(output, entry));
  manifest.styles.push({ source: `src/styles/${entry}`, output: entry, sha256: await sha256(join(output, entry)) });
}
await writeFile(join(output, 'manifest.json'), `${JSON.stringify(manifest, null, 2)}\n`);
console.log(`Prepared ${manifest.scripts.length} TypeScript fixture bundles and ${manifest.styles.length} stylesheets in tests/runtime.`);
