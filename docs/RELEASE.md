# Package a local static release

> This document retains the supplied historical static-build packager workflow. For the current source ZIP/GitHub handoff, use `HANDOFF.md`, `QA-STATUS.md` and the [October 2 maintainer guide](refinement-20261002/MAINTAINER-GUIDE.md). The earlier parent-repository ignore warning below is historical; the complete current source handoff includes its media.

The build contains the website and its local images, fonts and videos. The parent Git repository ignores asset directories, so committing source alone does not deliver those media. This command copies the **completed build on disk**, including files that Git ignores, into a self-contained release folder. It does not build, upload, publish, commit or modify the website.

## Prepare and package

Use Node 22.12 or newer. From `site_ts/`, finish a successful production build and its required review first:

```sh
npm run build
```

Wait for that command to exit successfully. Do not package while another terminal or task is rebuilding the same `dist/`. Then choose a new output directory:

```sh
node scripts/package-release.mjs --dist dist --out ../tasks/2026-10-01-website-delivery/releases/community-hub-2026-10-01
```

Both paths are explicit and relative to the working directory. Existing release directories are never overwritten. Use a new name for a revised candidate. Output cannot be inside the input, or contain the input.

The release layout is:

```text
community-hub-2026-10-01/
  site/                       # Serve this directory as the website root
    index.html
    ...other HTML routes...
    _astro/
    assets/                   # All built local media, including unused assets
  release-manifest.json        # Relative paths, byte counts, SHA-256 per file
  SHA256SUMS                  # All site files plus the manifest
```

Only regular files from the supplied build are copied. Source code, dependency folders and unrelated project files are not collected from elsewhere. Files are staged and validated before the release destination is created. The command never fetches remote resources.

## What the command checks

- A nonempty `index.html` exists.
- Every file's bytes and metadata agree before copying, during the staged copy, and after validation. A short quiet period helps detect ongoing writes. A detected change fails the command and removes its staging directory.
- Static local HTML and SVG `src`, `href`, `poster`, `data-src`, `srcset`, and `imagesrcset` references resolve within the copied tree; refresh redirects are checked too.
- CSS URLs and imports, including HTML style blocks/attributes, and ordinary emitted JavaScript module imports resolve locally. Query strings and fragments do not change the file lookup. Directory URLs resolve to `index.html`.
- Symlinks, non-regular files and ambiguous control characters in filenames are rejected. Filesystem paths are checked for overlap through existing parent symlinks.
- Known sensitive filenames/directories, such as `.env`, `.git`, `node_modules`, credential files and private-key file extensions, are rejected. Text files are also checked for private-key markers and recognizable AWS/GitHub credential formats. Error messages identify the file without printing credential contents.

These checks are deliberately bounded. They do not execute runtime-generated URLs, inspect all possible JavaScript expressions, validate anchor IDs, contact external services, establish image permissions, or discover every possible secret format. Absolute HTTP(S) URLs, including canonical links, remain external and are not rewritten. Review release content and the existing site tests before publishing. The quiet-period and hash checks detect changing input; they do not replace the requirement to start from a successful build.

## Verify or transfer the release

From the completed release directory, verify every packaged file and the manifest:

```sh
shasum -a 256 -c SHA256SUMS
```

On Linux, `sha256sum -c SHA256SUMS` is equivalent. Checksums establish the copied bytes, not who approved them. Keep the manifest and checksum file with the site when transferring it.

If an archive is convenient, run this from the release's parent directory after packaging succeeds:

```sh
tar -czf community-hub-2026-10-01.tar.gz community-hub-2026-10-01
```

Extract it elsewhere and repeat the checksum verification. Configure any eventual static host to serve `site/`, preserving all files and relative paths. Publishing is a separate action.

## Fixture verification

```sh
node --test tests/package-release.test.mjs
```

These tests create disposable small builds rather than reading the active `dist/`. They cover byte-identical media and manifest hashes, missing references, external/data URLs, sensitive material, symlinks, output protection, incomplete input, changing input and cleanup. They can run while another task is building the real site.
