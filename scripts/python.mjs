import { spawnSync } from 'node:child_process';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const local = join(root, '.venv', process.platform === 'win32' ? 'Scripts/python.exe' : 'bin/python');
const candidates = process.env.PYTHON ? [process.env.PYTHON] : [local, 'python3', 'python'];
const python = candidates.find(command => spawnSync(command, ['-c', 'import playwright, lxml, PIL'], { cwd: root, stdio: 'ignore' }).status === 0);
if (!python) {
  console.error('Test dependencies are missing. Create .venv and install requirements-dev.txt, or set PYTHON to an interpreter with those packages.');
  process.exit(1);
}
const result = spawnSync(python, process.argv.slice(2), { cwd: root, stdio: 'inherit', env: process.env });
if (result.error) console.error(result.error.message);
process.exit(result.status ?? 1);
