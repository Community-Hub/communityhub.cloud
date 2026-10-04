import { createRequire } from 'node:module';
import { fileURLToPath, pathToFileURL } from 'node:url';

const rootURL = new URL('../', import.meta.url);
const projectRequire = createRequire(new URL('package.json', rootURL));
// @astrojs/check resolves TypeScript from its own location. In a hoisted workspace,
// that can select an unrelated older compiler. Use its checker with this project's SDK.
const checkRequire = createRequire(projectRequire.resolve('@astrojs/check'));
const { AstroCheck } = await import(pathToFileURL(checkRequire.resolve('@astrojs/language-server')).href);
const expected = projectRequire('./package.json').dependencies.typescript;
const actual = projectRequire('typescript/package.json').version;
if (actual !== expected) throw new Error(`Website requires TypeScript ${expected}; resolved ${actual}. Run the managed install.`);
console.log(`Checking website with its pinned TypeScript ${actual}`);
const checker = new AstroCheck(fileURLToPath(rootURL), projectRequire.resolve('typescript'));
const result = await checker.lint({logErrors: {level: 'hint'}});
console.log(`Result (${result.fileChecked} files): ${result.errors} errors, ${result.warnings} warnings, ${result.hints} hints`);
process.exitCode = result.errors ? 1 : 0;
