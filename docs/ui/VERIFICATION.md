# UI foundation verification

October 1, 2026. This report describes the reusable UI foundation and its Contact/Pricing integrations. It does not certify the entire website for release.

## Delivered requirements and evidence

| Requirement | Implementation | Authoritative evidence |
| --- | --- | --- |
| Reusable components | Button, ActionLink, Field, StatusMessage; pure renderers and Astro wrappers share one implementation | `src/lib/ui/`, `src/components/ui/`; public prop types checked by Astro |
| Scalable architecture / developer experience | Rendering, styling, behavior and page decisions separated; no added dependencies or client framework | `README.md` in this folder; source imports; package dependencies unchanged |
| Loading states | Native disabled/busy buttons; separate async status region; original button state restored | Unit contracts plus browser tests for repeated loading and initial server-rendered loading |
| Empty/error/retry states | Explicit async states, actionable messages, no stale focusable content, retry focus restoration | Browser async-state test; independent review of live example |
| Edge cases | Escaping, unsafe URL rejection, blank required values, disabled controls, long/Unicode drafts, latest-response ownership, timeout, disposal | 5 renderer unit tests and 13 browser tests |
| Accessibility | Native labels/controls, required markers, field descriptions/errors, first-invalid focus, polite status, visible focus, minimum targets, hidden unavailable navigation | Actual keyboard/browser checks; independent visitor review |
| Responsive design | Contact/Pricing at 1280×720, 390×844, 375×667; full-width fields, natural form growth | `geometry.json`, final screenshots and visitor review |
| Usage examples / API / best practices | Typed API table, Astro and content-builder snippets, async integration and extension guidance | `docs/ui/README.md`; development `/ui-examples/foundation` |
| Production implementation | Shared validation and renderers used by real Contact/Pricing; developer example omitted from static output | Built HTML, source integrations, `final-build.json` |
| Independent rendered review | Final bounded review of actual built forms and component example | `docs/ui/visitor-review.md` |

## Passing checks

- `npm run check`: 0 errors, 0 warnings; 7 pre-existing async-conversion hints in other script modules.
- `npm run build`: successful static build, including the existing copy-policy guard. The development component route is absent from `dist`.
- `npm run test:unit`: 30 passed (including the 5 new renderer/security contracts).
- `npm run test:fixtures`: 24 script bundles and 39 stylesheets prepared.
- `node scripts/python.mjs -m unittest discover -s tests/browser -p 'test_ui_foundation.py' -v`: 13 passed against the final build/runtime.
- `npm run test:contracts`: 8 passed, covering route preservation, local links/assets/fragments and original source writing/photos.

Logs, build SHA-256 manifest and screenshots are in `tests/artifacts/ui-foundation/`. `final-build.json` identifies the actual built HTML and all JavaScript/CSS assets. Component source is unchanged after that build except documentation/test additions.

## Broader-suite findings remain open

The broader website suite is not green. The first full-browser run was stopped when the build was refreshed so it would not be misrepresented as a single-build result. Focused reruns captured the following outside the component/form scope:

- The homepage heading test expects `#people h2`, which is absent from the current generated markup.
- Product-opening tests expect `.page-intro h1` on The Hub and Community Calendar; those selectors do not match the current generated markup.
- The lesson search stays focused across phone resizes but is positioned above the header in the 390×844 case.
- The 17-test navigation regression selection reports four failures in direct-cut keyboard/wheel/lesson-scrolling behavior; other selected controller/mobile-menu tests pass. See `navigation-regressions.log` for exact cases and sampled positions.

`broader-suite-findings.log` reproduces the heading/product/lesson findings. These failures were not suppressed or assertions weakened. The new styles use component selectors; the scene controller was not reworked. The shared navigation visibility change hides an already unavailable arrow from visibility/accessibility queries, independently verified for both unavailable and available states. Form feedback also invokes the existing synchronous `ch:fit` hook before focus moves, preventing a newly inserted recovery link from racing scene measurement. A full pre-change baseline was not reconstructed, so this report does not claim causal proof that every broader failure predates this task.

Do not treat passing component checks as approval to release the entire website. Resolve or reconcile the broader failures before a site-wide production release.

## Boundaries

- No deployment or release packaging was performed.
- Contact/Pricing prepare local email drafts. Tests intercept mailto destinations; no email was sent. Opening/delivery in real mail clients is not verified.
- Deterministic browser tests block remote services and fonts. Their screenshots use available fallback fonts. The live development example was also inspected separately; it uses explicit simulated responses.
- Browser testing used Chromium, keyboard input, native wheel behavior and reduced-motion contexts. Cross-browser assistive-technology testing and physical-device testing were not performed.
- The components do not add animation. Forced-colors styles are included but a human high-contrast/assistive-technology certification was not performed.
- No load test, traffic benchmark or claim of operation at millions of users is made. Static rendering and optional browser modules minimize runtime overhead.

## Design research and guardrails

Before editing, the rendered Contact page and two primary references were inspected: [Impeccable's pattern catalog](https://impeccable.style/slop/) and [NN/G's aesthetic/minimalist design guidance](https://www.nngroup.com/articles/aesthetic-minimalist-design/). The implementation preserves the incumbent typography and source palette while avoiding nested ornamental cards, placeholder-only labels, tiny targets, color-only errors and false success messages. The independent review records its own primary accessibility sources.
