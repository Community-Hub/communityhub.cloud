import { createRequire } from 'node:module';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { useProjectTypeScript } from './project-typescript.mjs';

const rootURL = new URL('../', import.meta.url);
const projectRequire = createRequire(new URL('package.json', rootURL));
const sdk = useProjectTypeScript(new URL('package.json', rootURL));
// @astrojs/check resolves TypeScript from its own location. In a hoisted workspace,
// that can select an unrelated older compiler. Use its checker with this project's SDK.
const checkRequire = createRequire(projectRequire.resolve('@astrojs/check'));
const { AstroCheck } = await import(pathToFileURL(checkRequire.resolve('@astrojs/language-server')).href);
console.log(`Checking website and checker dependencies with pinned TypeScript ${sdk.version}`);
const checker = new AstroCheck(fileURLToPath(rootURL), sdk.compilerPath);
const result = await checker.lint({logErrors: {level: 'hint'}});
console.log(`Result (${result.fileChecked} files): ${result.errors} errors, ${result.warnings} warnings, ${result.hints} hints`);
process.exitCode = result.errors ? 1 : 0;
