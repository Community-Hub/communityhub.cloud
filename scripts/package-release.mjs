#!/usr/bin/env node
import { constants } from 'node:fs';
import { lstat, mkdir, mkdtemp, open, readdir, realpath, rename, rm, writeFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { basename, dirname, extname, join, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const digest = bytes => createHash('sha256').update(bytes).digest('hex');
const textTypes = new Set(['.html', '.css', '.js', '.mjs', '.json', '.svg', '.xml', '.txt', '.map', '.webmanifest']);
const sensitiveName = /^(?:\.env(?:\..*)?|\.git|\.svn|node_modules|id_(?:rsa|dsa|ecdsa|ed25519)(?:\.pub)?|credentials?(?:\.[^.]+)?)$|\.(?:pem|key|p12|pfx|keystore)$/i;
const sensitiveContent = /-----BEGIN (?:RSA |EC |DSA |OPENSSH )?PRIVATE KEY-----|\b(?:AKIA|ASIA)[A-Z0-9]{16}\b|\bgh[pousr]_[A-Za-z0-9]{36}\b|\bgithub_pat_[A-Za-z0-9_]{60,}\b/;
const stableStat = stat => `${stat.dev}:${stat.ino}:${stat.size}:${stat.mtimeNs}:${stat.ctimeNs}`;
const inside = (parent, child) => child === parent || child.startsWith(parent + sep);
const changed = () => new Error('Build changed during packaging. Wait for a successful completed build and retry.');

async function resolvedNewPath(path) {
  try { return await realpath(path); }
  catch (error) {
    if (error.code !== 'ENOENT') throw error;
    return join(await resolvedNewPath(dirname(path)), basename(path));
  }
}

/** Read regular files without following symlinks, optionally creating the isolated copy. */
async function snapshot(root, copyTo) {
  const files = [];
  const texts = new Map();
  const rootStat = await lstat(root);
  if (rootStat.isSymbolicLink()) throw new Error('Symlink build root is not allowed.');
  if (!rootStat.isDirectory()) throw new Error('Build input must be a directory.');
  async function visit(folder = '') {
    for (const name of (await readdir(join(root, folder))).sort()) {
      const path = folder ? `${folder}/${name}` : name;
      if (/[\x00-\x1f\x7f\\]/.test(path)) throw new Error('Unsupported control character or backslash in a build filename.');
      if (sensitiveName.test(name)) throw new Error(`Sensitive file or directory is not allowed: ${path}`);
      const full = join(root, path);
      const stat = await lstat(full, { bigint: true });
      if (stat.isSymbolicLink()) throw new Error(`Symlink is not allowed: ${path}`);
      if (stat.isDirectory()) { await visit(path); continue; }
      if (!stat.isFile()) throw new Error(`Non-regular file is not allowed: ${path}`);
      const handle = await open(full, constants.O_RDONLY | constants.O_NOFOLLOW);
      let bytes;
      try {
        if (stableStat(stat) !== stableStat(await handle.stat({ bigint: true }))) throw changed();
        bytes = await handle.readFile();
        if (stableStat(stat) !== stableStat(await handle.stat({ bigint: true }))) throw changed();
      } finally { await handle.close(); }
      if (textTypes.has(extname(name).toLowerCase())) {
        const text = bytes.toString('utf8');
        if (sensitiveContent.test(text)) throw new Error(`Sensitive credential pattern detected in ${path}`);
        if (copyTo) texts.set(path, text);
      }
      files.push({ path, bytes: bytes.length, sha256: digest(bytes), stat: stableStat(stat) });
      if (copyTo) {
        await mkdir(dirname(join(copyTo, path)), { recursive: true });
        await writeFile(join(copyTo, path), bytes, { flag: 'wx', mode: 0o644 });
      }
    }
  }
  await visit();
  return { files, texts };
}

const decodeEntities = value => value.replace(/&(?:amp|quot|apos|lt|gt|#\d+|#x[0-9a-f]+);/gi, entity => {
  const names = { '&amp;': '&', '&quot;': '"', '&apos;': "'", '&lt;': '<', '&gt;': '>' };
  return names[entity.toLowerCase()] ?? String.fromCodePoint(parseInt(entity.slice(2, -1).replace(/^x/i, ''), /^&#x/i.test(entity) ? 16 : 10));
});

function srcsetURLs(value) {
  const urls = [];
  let rest = value;
  while ((rest = rest.replace(/^[\s,]+/, ''))) {
    const match = /^\S+/.exec(rest);
    const url = match[0];
    rest = rest.slice(url.length);
    if (url.endsWith(',')) { urls.push(url.replace(/,+$/, '')); continue; }
    urls.push(url);
    const comma = rest.indexOf(',');
    if (comma < 0) break;
    rest = rest.slice(comma + 1);
  }
  return urls;
}

/** Check static emitted references only; no remote requests or JavaScript execution. */
function verifyReferences(files, texts) {
  const paths = new Set(files.map(file => file.path));
  let checked = 0;
  function check(file, raw) {
    const value = decodeEntities(raw).trim();
    if (!value || value.startsWith('#') || value.startsWith('//') || /^[a-z][a-z\d+.-]*:/i.test(value)) return;
    const url = new URL(value, `https://release.invalid/${file.split('/').map(encodeURIComponent).join('/')}`);
    let path;
    try { path = decodeURIComponent(url.pathname).replace(/^\//, ''); }
    catch { throw new Error(`Malformed local reference in ${file}`); }
    if (path.endsWith('/') || !path) path += 'index.html';
    if (!paths.has(path) && !paths.has(`${path}/index.html`)) throw new Error(`Missing local reference in ${file}: ${path}`);
    checked++;
  }
  for (const [file, text] of texts) {
    const ext = extname(file).toLowerCase();
    let cssSource = ext === '.css' ? text : '';
    if (ext === '.html' || ext === '.svg') {
      // Script bodies are not HTML, and may contain strings that look like tags.
      const markup = text.replace(/<!--[\s\S]*?-->/g, '').replace(/(<script\b[^>]*>)[\s\S]*?<\/script\s*>/gi, '$1</script>');
      cssSource = [...markup.matchAll(/<style\b[^>]*>([\s\S]*?)<\/style\s*>/gi)].map(match => match[1]).join('\n');
      for (const [tag] of markup.matchAll(/<[a-z][^>]*>/gi)) {
        if (/^<base\b/i.test(tag)) throw new Error(`Unsupported base URL in ${file}; package root-relative static output.`);
        for (const match of tag.matchAll(/\s(src|href|poster|data-src|xlink:href|srcset|imagesrcset)\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]+))/gi)) {
          const value = match[2] ?? match[3] ?? match[4];
          if (/srcset$/i.test(match[1])) srcsetURLs(value).forEach(url => check(file, url));
          else check(file, value);
        }
        for (const match of tag.matchAll(/\s(?:style|fill|stroke|filter|clip-path|mask)\s*=\s*(?:"([^"]*)"|'([^']*)')/gi)) cssSource += '\n' + decodeEntities(match[1] ?? match[2]);
        if (/^<meta\b/i.test(tag) && /http-equiv\s*=\s*["']?refresh\b/i.test(tag)) {
          const target = /\burl\s*=\s*([^"'<>]+)/i.exec(tag)?.[1]?.trim();
          if (target) check(file, target);
        }
      }
    }
    if (ext === '.css' || ext === '.html' || ext === '.svg') {
      const css = cssSource.replace(/\/\*[\s\S]*?\*\//g, '');
      for (const match of css.matchAll(/url\(\s*(?:"([^"]*)"|'([^']*)'|([^)]*))\s*\)|@import\s+["']([^"']+)["']/gi)) {
        const value = (match[1] ?? match[2] ?? match[3] ?? match[4]).replace(/\\([0-9a-f]{1,6})\s?|\\(.)/gi, (_, hex, char) => hex ? String.fromCodePoint(parseInt(hex, 16)) : char);
        check(file, value);
      }
    }
    if (ext === '.js' || ext === '.mjs') {
      for (const match of text.matchAll(/\b(?:import|export)\s*(?:[^;"']*?\bfrom\s*)?["']([^"']+)["']|\bimport\s*\(\s*["']([^"']+)["']\s*\)/g)) {
        const url = match[1] ?? match[2];
        if (url.startsWith('.') || url.startsWith('/')) check(file, url);
      }
    }
  }
  return checked;
}

export async function packageRelease({ dist, output }) {
  dist = resolve(dist);
  output = resolve(output);
  const sourceStat = await lstat(dist);
  if (sourceStat.isSymbolicLink()) throw new Error('Symlink build root is not allowed.');
  dist = await realpath(dist);
  // Check through existing parent symlinks before creating any directories.
  output = join(await resolvedNewPath(dirname(output)), basename(output));
  if (inside(dist, output) || inside(output, dist)) throw new Error('Build and release output paths must not overlap.');
  try { await lstat(output); throw new Error('Release output already exists; choose a new path.'); }
  catch (error) { if (error.code !== 'ENOENT') throw error; }
  const before = await snapshot(dist);
  if (!before.files.some(file => file.path === 'index.html' && file.bytes > 0)) throw new Error('Completed build must include a nonempty index.html.');
  await mkdir(dirname(output), { recursive: true });
  // A short quiet period catches builds that are still writing their first files.
  await new Promise(resolve => setTimeout(resolve, 150));
  const stage = await mkdtemp(join(dirname(output), '.ch-release-'));
  try {
    const copied = await snapshot(dist, join(stage, 'site'));
    if (JSON.stringify(before.files) !== JSON.stringify(copied.files)) throw changed();
    const localReferencesChecked = verifyReferences(copied.files, copied.texts);
    const files = copied.files.map(({ stat, ...file }) => file);
    const manifest = {
      formatVersion: 1,
      createdAt: new Date().toISOString(),
      siteDirectory: 'site',
      htmlPages: files.filter(file => file.path.endsWith('.html')).length,
      totalBytes: files.reduce((sum, file) => sum + file.bytes, 0),
      localReferencesChecked,
      files,
    };
    const manifestText = JSON.stringify(manifest, null, 2) + '\n';
    await writeFile(join(stage, 'release-manifest.json'), manifestText, { flag: 'wx' });
    const sums = files.map(file => `${file.sha256}  site/${file.path}\n`).join('') + `${digest(manifestText)}  release-manifest.json\n`;
    await writeFile(join(stage, 'SHA256SUMS'), sums, { flag: 'wx' });
    const after = await snapshot(dist);
    if (JSON.stringify(before.files) !== JSON.stringify(after.files)) throw changed();
    // Never replace a release created by a concurrent invocation.
    await mkdir(output);
    try {
      for (const name of ['site', 'release-manifest.json', 'SHA256SUMS']) await rename(join(stage, name), join(output, name));
    } catch (error) { await rm(output, { recursive: true, force: true }); throw error; }
    return { output, ...manifest };
  } finally { await rm(stage, { recursive: true, force: true }); }
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try {
    const values = process.argv.slice(2);
    if (values.includes('--help')) {
      console.log('Usage: node scripts/package-release.mjs --dist <completed-build> --out <new-release-folder>\nRun only after a successful build. Copies local files; never builds, uploads, or publishes.');
    } else {
      const options = {};
      while (values.length) {
        const key = values.shift();
        if (!['--dist', '--out'].includes(key) || !values.length || values[0].startsWith('--') || options[key]) throw new Error('Expected --dist <completed-build> --out <new-release-folder>.');
        options[key] = values.shift();
      }
      if (!options['--dist'] || !options['--out']) throw new Error('Both --dist and --out are required.');
      const result = await packageRelease({ dist: options['--dist'], output: options['--out'] });
      console.log(`Local release ready: ${result.output}\n${result.files.length} files, ${result.htmlPages} HTML pages, ${result.totalBytes} bytes; ${result.localReferencesChecked} local references checked.\nServe the site/ subdirectory. Nothing was published.`);
    }
  } catch (error) { console.error(`Release packaging failed: ${error.message}`); process.exitCode = 1; }
}
