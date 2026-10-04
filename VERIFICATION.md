> Historical baseline only: this report describes the September 30 migration, before the October 2 refinements and current35-content-page/3-redirect source. It is not the final candidate’s test evidence. See [the October 2 review and current limitations](docs/refinement-20261002/README.md).

# TypeScript migration verification

Verified September 30, 2026. The Astro + TypeScript site is running locally at http://127.0.0.1:4327/. The existing prototype was preserved. No deployment or commit was made.

## Delivered

- All 32 content pages and three legacy redirects render through Astro.
- Six native TypeScript content modules, a typed content catalog, typed shared renderers, and shared Astro document/navigation/footer components replace the Python site builder.
- All 16 browser interaction scripts are checked TypeScript, with typed section state, DOM helpers, custom events, and validated network responses. The original initialization order is retained.
- Source styles, local media, metadata, sitemap, live embeds, page links and copy-policy checks are preserved. The build uses Node only; Python is used for QA.
- The source remains separate in `site_ts/`, with no build dependency on `site_src6`, `site6` or `reference/`.

## Verification

| Check | Result | Evidence |
| --- | --- | --- |
| TypeScript and Astro checking | Passed: no errors or warnings; seven editor suggestions about optional async-function syntax | `tests/artifacts/final-validation.log` |
| Production build and final HTML/CSS copy guard | Passed, 35 HTML routes | `tests/artifacts/final-validation.log` |
| Copy-policy regression tests | 3 passed; invalid footer and CSS text were first observed failing against the missing guard | `tests/build-guard.test.mjs`, final validation log |
| Migration content comparison | 2 passed, covering every route, text, controls, section boundaries, links, media, titles and canonical URLs | `tests/test_migration_parity.py`, final validation log |
| Existing regression suite | 109 test methods: 106 passed in the deterministic run; three live checks passed separately | Final validation log, `live-dashboard-rerun.log`, `live-voices.log` |
| All-page navigation | Passed complete stop-ownership checks at 1440×900, 1280×720 and 390×844, wheel/touch navigation, and complete forward/backward traversal of the long pages | `tests/browser/test_page_isolation.py`, final validation log |
| Visual comparison | 192/192 passed: all 32 pages, three screen sizes, two stops each; 384 screenshots, all 24 contact sheets inspected | `tests/artifacts/visual-parity/README.md` |
| Live service smoke | Real calendar/jobs/heat-map/load-profile responses accepted; charts, jobs, embed presets and colors work; no runtime exceptions | `tests/artifacts/runtime-smoke/` |
| Normal motion | Hero played its full 17.9 seconds once, held the last frame, advanced after 3.29 seconds; story next/pause controls and single-story visibility passed | `tests/artifacts/normal-motion/summary.json` |
| Local URLs | All 35 preview routes respond; referenced local destinations/assets exist; homepage, `.html` routes and redirects also work in development | Direct HTTP and built-link checks |
| Original source | No Python, JavaScript or CSS source changed from the migration-start backup | `tests/artifacts/migration-manifest.json` |

The three opt-in live tests are the two dashboard checks and the filtered Voices API check. The separate Voices run also repeated its four deterministic source/layout tests. There are **114 distinct automated tests** across the regression suite, copy-policy tests and content-parity tests, plus the visual comparisons and normal-motion smoke check.

## Resolved findings

The inherited homepage assertion still selected `.pc` product cards even though the current source uses `[data-eng-panel]`. Both baseline and migrated output contained zero old cards. The selector was updated while preserving the one-or-two-link requirement. A live chart test also needed to select the Building Dashboard tab after centering the taller product section; its chart, data and accessibility assertions are unchanged.

Independent review found that checking page definitions alone missed text added by the shared Astro layout and CSS. A final build hook now checks rendered HTML and CSS generated text. The test runner also selects a Python interpreter with the required packages, so the documented npm commands work on this checkout despite its colon-containing path.

One visual comparison initially measured a header class before a native scroll event had arrived. The screenshots were already pixel-identical. The harness now settles that event before measurement; the targeted phone rerun passed. Original evidence and the successful rerun remain in the visual report.

The final generated HTML/runtime hashes match the captured visual candidate. The maximum measured visual difference was 0.0521% of pixels and concerned small dynamic details, with matching visible geometry and section ownership.

## Boundaries

Browser checks used Chromium with desktop and phone emulation. Deterministic layout comparisons blocked third-party services; separate checks exercised the real services. Physical-device and other browser-engine testing were not performed. Existing source-dependent content limitations were carried forward accurately rather than inferred away.

Media is present locally in `public/assets/`. The parent repository ignores asset directories; packaging those media for a fresh checkout or deployment still needs to be handled when publishing. The build and preview here are complete and self-contained on disk.

See `README.md` for setup, editing and test commands.
