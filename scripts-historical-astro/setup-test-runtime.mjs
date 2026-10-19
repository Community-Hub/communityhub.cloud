import { spawnSync } from 'node:child_process';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

// Normal Local runs use the explicitly prepared development environment.
if (!process.env.CI && !process.env.GITHUB_ACTIONS) process.exit(0);
const root = fileURLToPath(new URL('../', import.meta.url));
const interpreter = ['python3', 'python'].find(command => spawnSync(command, ['--version'], {stdio:'ignore'}).status === 0);
if (!interpreter) throw new Error('CI requires Python 3 to prepare browser acceptance.');
function run(command, args) {
  const result = spawnSync(command, args, {cwd:root, stdio:'inherit'});
  if (result.error) throw result.error;
  if (result.status !== 0) process.exit(result.status ?? 1);
}
run(interpreter, ['-m', 'venv', '.venv']);
const python = join(root, '.venv', process.platform === 'win32' ? 'Scripts/python.exe' : 'bin/python');
run(python, ['-m', 'pip', 'install', '-r', 'requirements-dev.txt']);
run(python, ['-m', 'playwright', 'install', ...(process.platform === 'linux' ? ['--with-deps'] : []), 'chromium']);
