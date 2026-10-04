import { createRequire, registerHooks } from 'node:module';
import { fileURLToPath, pathToFileURL } from 'node:url';

// All checker dependencies must use the same compiler as the supplied SDK.
// Otherwise hoisted Volar helpers can mix the workspace's older TypeScript APIs
// with this project's newer SDK and crash during module resolution.
export function useProjectTypeScript(packageURL) {
  const projectRequire = createRequire(packageURL);
  const expected = projectRequire('./package.json').dependencies.typescript;
  const actual = projectRequire('typescript/package.json').version;
  if (actual !== expected) throw new Error(`Website requires TypeScript ${expected}; resolved ${actual}. Run the managed install.`);
  const compilerPath = projectRequire.resolve('typescript');
  const compilerURL = pathToFileURL(compilerPath).href;
  const compilerPackageURL = pathToFileURL(projectRequire.resolve('typescript/package.json'));
  const hooks = registerHooks({
    resolve(specifier, context, nextResolve) {
      if (specifier === 'typescript') return { url: compilerURL, shortCircuit: true };
      if (specifier.startsWith('typescript/')) {
        const url = new URL(specifier.slice('typescript/'.length), compilerPackageURL);
        return nextResolve(context.conditions.includes('require') ? fileURLToPath(url) : url.href, context);
      }
      return nextResolve(specifier, context);
    },
  });
  return { compilerPath, version: actual, hooks };
}
