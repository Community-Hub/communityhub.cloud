# Community Hub: Astro + TypeScript

Current October 2 changes and verification scope: [refinement review](docs/refinement-20261002/README.md). Detailed setup, content maintenance, navigation contracts and release guidance: [maintainer guide](docs/refinement-20261002/MAINTAINER-GUIDE.md). Older verification documents describe their dated source version, not this candidate.

This is the refined working copy of the user-supplied Community Hub Astro/TypeScript project. It preserves the uploaded source’s 35 content pages, three legacy redirects, local assets, and section-navigation contracts. October 1 refinements use the original CommunityHub.cloud writing and final September 30 meeting decisions, documented in the [content and design brief](docs/content-and-design-brief.md). The production build uses Node, Astro, and TypeScript. Python is used only for quality assurance.

The supplied archive and earlier prototype are preserved separately. This refined copy was reviewed on an owner-only private preview. The handoff’s `QA-STATUS.md` records the final observed checks and remaining limitations. It has not been publicly deployed.

## Run locally

Use Node 22.12 or newer and npm 9.6.5 or newer. From this project directory:

```sh
npm ci
npm run check
npm run build
npm run preview -- --port 4327
```

The preview is available at [http://127.0.0.1:4327/](http://127.0.0.1:4327/). It serves the generated `dist/` directory. For editing with automatic reload:

```sh
npm run dev
```

Astro prints the development URL, normally `http://127.0.0.1:4321/`. Existing links such as `data-dashboard.html` remain valid. Builds emit individual `.html` files, a sitemap, local media, and bundled assets under `dist/_astro/`.

`npm run check` checks TypeScript and Astro source. `npm run build` builds the site and runs the final HTML/CSS copy-policy guard. No Python interpreter, legacy source checkout, or legacy generated HTML is used to build or run the new site.

## Source structure

Reusable controls and state handling are documented in [the UI foundation guide](docs/ui/README.md), including typed props, Astro/content-builder examples, and testing instructions. Run the development server and visit `/ui-examples/foundation` for interactive examples. That reference route is omitted from production builds.

| Location | Responsibility |
| --- | --- |
| `src/pages/` | Homepage, content routes, legacy redirects, and sitemap |
| `src/layouts/PageLayout.astro` | Shared document, metadata, assets, and script entry point |
| `src/components/` | Shared header, footer, brand, and navigation icons |
| `src/content/site.ts` | Registers the 35 typed page definitions |
| `src/content/home.ts`, `people.ts`, `products.ts`, `resources.ts`, `products-a.ts`, `products-b.ts` | Native TypeScript page content and section markup |
| `src/content/catalog.ts` | Shared products, audiences, case studies, quotes, and public destinations |
| `src/lib/site.ts`, `content-helpers.ts`, `types.ts` | Typed page model, common renderers, image dimensions, and build-time checks |
| `src/content/copy-policy.json` | Shared copy rules used before and after rendering |
| `src/scripts/` | Checked TypeScript browser behavior; `index.ts` preserves initialization order |
| `src/styles/` | Shared styles and responsive section layouts |
| `public/assets/` | Original local media and separately named official-site source photos |
| `src/content/live-products.json`, `tests/fixtures/live-*-source.json` | Independently captured official text, source URLs and photo hashes |
| `scripts/verify-build.mjs` | Astro build hook checking final HTML and CSS generated text |

The section controller, pop visibility, section fitting, and iframe interaction controls remain separate TypeScript modules. Keep their DOM attributes, initialization order, and one-section ownership contract aligned when changing interactions.

The original project documented a frozen migration baseline in `reference/` and an external source backup. Neither was present in the supplied archive. They are historical comparison evidence, not production dependencies. Migration-only checks require those optional historical files; this handoff does not claim to reconstruct them. See [the migration contract](docs/MIGRATION.md).

## Media and repository packaging

All media needed by this local build is included in `public/assets/`; it does not depend on symlinks to the earlier site. Astro copies those assets into `dist/assets/`.

The supplied project warned that its original parent repository ignored directories named `assets/`. This source handoff includes the actual local media rather than relying on that repository. Retain the complete `public/` directory when copying or deploying the project. A source-only checkout without those files will not reproduce the website.

To hand off a completed static build with its local media, use the [local release packager](docs/RELEASE.md):

```sh
node scripts/package-release.mjs --dist dist --out ../releases/community-hub-review
```

Run it after a successful build and choose a new output directory for each candidate. It validates local references, copies the complete build, and writes a manifest and SHA-256 checksums. Serve the resulting `site/` directory. This packages the generated website; it does not publish it or resolve asset distribution for a fresh source checkout.

## Quality assurance setup

The website itself needs only Node. Browser and visual QA also require Python with Playwright, lxml, Pillow, and Chromium. Install the Python packages from `requirements-dev.txt`.

A virtual environment keeps browser-test dependencies separate from the website. For macOS or Linux:

```sh
python3 -m venv "$HOME/.venvs/community-hub-qa"
export PYTHON="$HOME/.venvs/community-hub-qa/bin/python"
"$PYTHON" -m pip install -r requirements-dev.txt
"$PYTHON" -m playwright install chromium
```

Keep `PYTHON` set in the shell running the npm QA commands. The portable `scripts/python.mjs` runner uses that interpreter when configured. Otherwise it checks a project `.venv`, then `python3`, then `python`, selecting one that can import the required packages. No workstation-specific interpreter path is embedded in the project.

## Run checks

```sh
npm test
```

This runs type checking, the production build, copy-policy and release-packaging unit tests, fixture compilation, browser regressions, and current route/link/source-fidelity contracts. The historical migration comparison and live-service checks are separate:

```sh
npm run test:visual

CH_LIVE=1 node scripts/python.mjs -m unittest discover -s tests/browser -p 'test_dashboard_live_views.py' -v
CH_LIVE=1 node scripts/python.mjs -m unittest discover -s tests/browser -p 'test_voices_sources.py' -v
```

Useful individual commands:

```sh
npm run test:unit
npm run test:fixtures
npm run test:browser
npm run test:contracts
npm run test:parity
```

`test:fixtures` bundles the TypeScript modules as isolated browser IIFEs in `tests/runtime/` and copies their source styles. That generated test directory is separate from production output. Rebuild it after changing browser TypeScript or source CSS.

`test:browser` uses the built `dist/` site and includes gesture, layout, content, and complete-page navigation checks. Tests that need production services remain opt-in through `CH_LIVE=1`. `test:contracts` checks all 35 routes, local links/fragments, public-dashboard restrictions, and preserved official-site text and original photo bytes.

`test:parity` and `test:visual` require the frozen `reference/` directory. They document the September 30 migration, before the requested layout and content corrections; exact parity with that old design is intentionally no longer the current acceptance criterion. Those checks and their evidence remain available unchanged. The current review capture is generated with `CH_REVIEW_LIVE=1 node scripts/python.mjs scripts/capture-delivery-review.py` and saved under `tests/artifacts/website-delivery-20261001/review/`. Omit `CH_REVIEW_LIVE` for controlled captures with external feeds blocked; both modes allow the actual brand fonts.

The migration keeps existing source-dependent limitations visible. Live dashboards, charts, remote controllers, and feeds still depend on their external services. Passing deterministic layout checks does not establish the availability of those services or replace physical-device testing. The [browser suite notes](tests/browser/README.md) document two inherited selector/setup corrections while retaining their behavioral assertions. Current results and limitations are recorded in the [October 2 refinement review](docs/refinement-20261002/README.md). The [October 1 verification report](docs/VERIFICATION-2026-10-01.md) describes the historical source baseline, not this handoff.
