import test from 'node:test';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { spawnSync } from 'node:child_process';
import { mkdtemp, mkdir, writeFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';
import { useProjectTypeScript } from '../scripts/project-typescript.mjs';

test('hoisted checker helpers use the project compiler in both CommonJS and ESM', async () => {
  const fixture = await mkdtemp(join(tmpdir(), 'ch-website-compiler-'));
  let hooks;
  try {
    for (const [name, version] of [['project', '6.0.3'], ['hoisted', '4.9.5']]) {
      const dir = join(fixture, name);
      await mkdir(join(dir, 'node_modules', 'typescript'), { recursive: true });
      await writeFile(join(dir, 'package.json'), JSON.stringify({ dependencies: { typescript: version } }));
      await writeFile(join(dir, 'node_modules', 'typescript', 'package.json'), JSON.stringify({ version, main: 'index.cjs' }));
      await writeFile(join(dir, 'node_modules', 'typescript', 'index.cjs'), `module.exports = { version: '${version}' };`);
    }
    const legacy = createRequire(join(fixture, 'hoisted', 'package.json'));
    const baseline = spawnSync(process.execPath, ['-p', "require('typescript').version"], { cwd: join(fixture, 'hoisted'), encoding: 'utf8' });
    assert.equal(baseline.status, 0);
    assert.equal(baseline.stdout.trim(), '4.9.5', 'fixture reproduces conflicting hoisted compiler in a fresh process');
    const sdk = useProjectTypeScript(pathToFileURL(join(fixture, 'project', 'package.json')));
    hooks = sdk.hooks;
    assert.equal(legacy('typescript').version, '6.0.3');
    assert.equal(legacy('typescript/package.json').version, '6.0.3');
    const helper = join(fixture, 'hoisted', 'helper.mjs');
    await writeFile(helper, "import ts from 'typescript'; export default ts.version;");
    assert.equal((await import(pathToFileURL(helper).href)).default, '6.0.3');
    assert.equal(legacy('node:path').basename('/test/file'), 'file', 'unrelated imports retain normal resolution');
    hooks.deregister();
    hooks = undefined;
  } finally {
    hooks?.deregister();
    await rm(fixture, { recursive: true, force: true });
  }
});
