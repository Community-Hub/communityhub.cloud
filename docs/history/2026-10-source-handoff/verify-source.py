#!/usr/bin/env python3
"""Verify a clean, merged extraction before npm creates generated files."""
import hashlib
import json
from pathlib import Path
import sys
root = Path(__file__).resolve().parent
checksums = {}
for line in (root / 'SHA256SUMS').read_text().splitlines():
    digest, name = line.split('  ', 1)
    if name in checksums or name.startswith('/') or '..' in Path(name).parts:
        raise SystemExit('Invalid checksum manifest')
    checksums[name] = digest
expected = set(checksums) | {'SHA256SUMS'}
actual = set()
for path in root.rglob('*'):
    if path.is_symlink():
        raise SystemExit('Unexpected symlink: ' + str(path.relative_to(root)))
    if path.is_file():
        actual.add(path.relative_to(root).as_posix())
if actual != expected:
    raise SystemExit('File set mismatch. Missing: ' + str(sorted(expected - actual)) + '; extra: ' + str(sorted(actual - expected)))
for name, digest in checksums.items():
    if hashlib.sha256((root / name).read_bytes()).hexdigest() != digest:
        raise SystemExit('Checksum mismatch: ' + name)
manifest = json.loads((root / 'SOURCE-MANIFEST.json').read_text())
for entry in manifest['files']:
    path = root / entry['path']
    if path.stat().st_size != entry['bytes'] or checksums[entry['path']] != entry['sha256']:
        raise SystemExit('Source manifest mismatch: ' + entry['path'])
print('Verified complete merged source: ' + str(len(manifest['files'])) + ' project files; all SHA-256 checksums and exact file set match')
