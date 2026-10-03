# Community Hub delivery verification

October 1, 2026. Local preview: http://127.0.0.1:4327/. No production deployment, commit, push, or external message.

## Current functional base

The verified functional base has home SHA256 `ce4b5c8c972c33c8f941d275d5c64551e2d3f68d14e11beac6717a3541d0a24a`. All 35 served HTML routes match production output. Exact route, bundle and source hashes are in [HUB_FINAL_BUILD_HASHES.json](../../tasks/2026-10-01-website-delivery/HUB_FINAL_BUILD_HASHES.json). Type checking reports 0 errors, 0 warnings and 7 hints; all 35 routes built successfully.

This base adds six Hub-only short-phone CSS rules to the previously tested `ba25c54b` build. They adjust reading width and spacing without changing TypeScript, source text or font sizes. The former 94px Hub chart-types continuation is resolved in the fresh 28-check confirmation. [The scoped correction note](../../tasks/2026-10-01-website-delivery/HUB_SHORT_PHONE_CORRECTION.md) records its research, trials and implementation boundary.

Earlier `ba25c54b` checks confirm the short-phone Products, Web and footer repairs, native preset synchronization and breakpoint focus. The broad all-route suite remains attributed to `9034f72a`. The Hub action accurately names its chart-types destination; an unsupported Research statement that every number is dated and sourced was removed while its figures remain. **The functional base is verified within the scopes below. Kwaku's newly requested Stripe-inspired visual refinement is pending its concrete brief; this is not acceptance of that future design. Packaging is on hold and no deployment is claimed.**

## Source and decisions

CommunityHub.cloud remains the authority for facts, product identity, source photographs, testimonial wording and photograph associations. This implementation chat read the complete September 30 transcript; the parent review supplied the September 28 reconciliation and recording evidence. Factual decisions and source boundaries are recorded in [the reconciled brief](content-and-design-brief.md).

Kwaku's current visual direction supersedes John's historical aesthetic preferences. The [research and implementation brief](../../tasks/2026-10-01-website-delivery/DESIGN_RESEARCH_RULES.md) requires primary-source research and inspection of the actual target before further design work. One copy change is expressly authorized: the Data Hub opening replaces generic adjective-led praise with its already documented Data Manager, Data Visualizer and Dashboard Builder behavior. Its original description remains on the homepage and in the catalog. Original quotations were not rewritten.

Eight live-source contract checks passed on the final candidate for homepage wording, mission, eight product descriptions, eight testimonials and destinations, team names/roles/photos, contact content, routes, fragments and privacy. The recorded 966-entry original source/asset audit and earlier 21-route composition comparison remain preservation evidence; they are not newly rerun measurements of the narrow final repair. The latter checked source-word multiplicities, image associations, links, IDs and widget hooks. Subsequent intentional changes, including the authorized Hub opening and removal of decorative Research panels and ending thumbnails, are recorded separately rather than described as an unchanged render.

## Implemented behavior

- One global header carries navigation. Narrative Contents uses a native desktop disclosure and the existing phone menu. Named Explore, Previous and Next controls remain where useful; decorative trailing arrows and the header down control are removed.
- Complete authored scenes retain natural-size reading. Research keeps ten stable article anchors and two measured charts; eight generic conceptual panels are removed. Schools' heading, introduction and three uses share one complete scene. Neighborhoods' six levels and cost note fit one desktop scene and three paired phone scenes.
- Products opens directly with all nine destinations on desktop and complete category scenes on phone. The See it live / GLSC path selects the public dashboard directly. Both paths reproduce and resolve the recorded click-through concerns.
- Product entrances use real source evidence. Data Dashboard's long original explanation remains complete across its opening and following context scene. Nested product frames and redundant lane labels are removed. Web appearance settings use a native disclosure while retaining the customization controls.
- Interior endings retain the page-specific invitation and compact, explicitly named links. Existing URLs, titles and descriptions remain, including 404 recovery destinations. Shared actions use Lato 700; the font request contains Lato and Comfortaa only. Interior titles use Lato; identity and short homepage expression retain Comfortaa.
- The homepage retains the single hands identity, five participants, exact eight two-way connections, once-per-visit sequence, settled state, visibility pausing, reduced-motion access, manual controls and original photographs.
- Contact opens with its usable form. Education retains search, grade filters and all 35 lessons. The conference announcement appears only on the homepage. Hamilton remains nonpublic.

## Checks and build boundaries

Evidence paths below are under `tests/artifacts/website-delivery-20261001/` unless marked as task evidence. Results are not added into one total because some focused suites overlap.

| Check | Tested build / result | Evidence |
| --- | --- | --- |
| Current type/build | ce4b5c8c: 0 errors, 0 warnings, 7 hints; 35 routes | `hub-short-final-check.log`, `hub-short-final-build.log` |
| Prior type/build | 9034f72a: 0 errors, 0 warnings, 7 hints; 35 routes | `research-correction-check.log`, `research-correction-build.log` |
| Runtime fixtures | ce4b5c8c: 21 TypeScript bundles, 24 stylesheets | `hub-short-final-fixtures.log` |
| Unit | 9034f72a: 23/23 pass | `research-correction-unit.log` |
| Source/routes/links/privacy | ce4b5c8c: 8/8 pass in 1.124s | `hub-short-final-contracts.log` |
| Control/browser regression batch | 9034f72a: 88/88 pass in 123.544s | `research-correction-controls.log` |
| All-route isolation, real gestures, authored scenes and Contents | 9034f72a: 11/11 pass in 211.467s | `navigation/research-correction-navigation.log` |
| Ending destination preservation | 9034f72a: all 31 applicable routes retain exact catalog URLs, titles and descriptions; contextual section labels resolve | `navigation/research-correction-ending-contracts.json` |
| Research/graph/review suite | 9034f72a: 8/8 pass in 20.632s | Task `research-correction/review-regressions.log` |
| Research, Schools and Neighborhoods focused rendering | 9034f72a: 176/176 checks, 26 captures, 0 browser exceptions | Task `research-correction/findings.md`, `summary.json`, `metrics.json` |
| Prior authored-scene, startup and content-isolation regressions | ba25c54b: 25/25 pass in 36.700s | `short-phone-regressions.log` |
| Prior Products/Web short-phone traversal | ba25c54b: 4/4 route/input cases pass at 375×667; Products 9 stops, Web 13; 22 captures | `navigation/short-phone-final/acceptance.json`, `metrics.json`, `metrics-retouch.json` |
| Prior breakpoint focus | ba25c54b: native preset and expanded Brand color remain visible, focused and owned through 375×667 → 390×844 → 375×667 | `navigation/short-phone-final/metrics.json` |
| Prior Web wheel and keyboard disclosure | ba25c54b: pass at 390×844 in normal/reduced motion with Lato loaded; zero page errors | `navigation/short-phone-final/390-regression/research-final-web-navigation.json` |
| Prior independent visitor confirmation | ba25c54b: both assigned reviews pass; Products/Web 6 route/viewport pairs and 59 screenshots | Task `round7-accepted-candidate/VISITOR_PRODUCTS_WEB_CONFIRMATION.md`, `VISITOR_RESOURCES_CONFIRMATION.md` |
| Current Hub repair confirmation | ce4b5c8c: 28/28 checks, 8 screenshots, 0 browser exceptions; actual CTA, phone gestures and resize pass | Task `visitor-review-final/hub-confirmation/results.json`, `run.log` |

The 11-method batch traverses every stop on all 32 content routes at 1440×900, 1280×720 and 390×844. It checks real single-wheel advance and forward/reverse mobile touch on every content route, traverses four long routes forward/backward by wheel, and verifies all three redirects. Six authored-scene methods cover Research direct/native fragments, 390↔1280 resize, focus transfer out of hidden articles, and desktop/phone Contents keyboard/native-panel scrolling. The older Stories overflow and Contact gesture-point failures are superseded by this passing batch; their old logs remain historical evidence. The full batch was not rerun on the narrow final repair.

On ba25c54b at 390×844, real wheel input moves opening → `#try` → `#fits` → `#try` → opening. Closed `#try` has one stop at 767px. Enter expands Appearance settings, Tab reaches visible Brand color, Shift+Tab returns to its summary, and Enter collapses with focus visible at the current stop. Further keyboard navigation does not enter hidden settings. Both normal and reduced motion pass.

At 375×667, every Products/Web stop and the shared footer pass forward/backward traversal by real wheel and CDP touch. Each owner-plus-authored-scene has one stop; the Web introduction and demo are distinct complete groups at this size. No adjacent-owner leak, horizontal overflow or hidden focus was detected. The initial Web touch reverse probe stopped before dispatch because three candidate rows overlapped the partner controls. Adding a clear heading row, with the same 32px control margin and actual-target assertion, allowed the full Web touch traversal to pass. The initial diagnostic and successful rerun are both preserved; no application change was made to accommodate the probe.

## Visual evidence and limits

The fresh [Hub confirmation](../../tasks/2026-10-01-website-delivery/visitor-review-final/hub-confirmation/results.json) checks the actual Explore chart types action at 375×667, 390×844 and 1280×720. At 375px, loaded Lato and blocked-font fallback each produce one complete chart-guide frame with all four explanations; the lowest text boundary is 653.25px/653px in the 667px viewport and body size remains 16px. Real wheel and touch advance to Data Manager and reverse to the chart guide; 375↔390 resize retains its complete scene. These eight fresh captures and 28 passing checks close the previously reported 94px continuation.

Final [Products/Web visitor confirmation](../../tasks/2026-10-01-website-delivery/round7-accepted-candidate/VISITOR_PRODUCTS_WEB_CONFIRMATION.md) visually inspected all 59 saved frames at 1280×720, 390×844 and 375×667. It confirms complete model/captions, meaningful short-phone Web groups, complete partner caption and footer, and no unresolved local clipping or repeated overflow fragments within that scope. [The final resource visitor check](../../tasks/2026-10-01-website-delivery/round7-accepted-candidate/VISITOR_RESOURCES_CONFIRMATION.md) verifies the actual Hub action reaches the promised chart explanations at both widths and the Research figures remain complete after removing the unsupported measurement promise. Neither review requests further aesthetic change.

Round 5 captured 24 route/viewport pairs across 12 selected routes, totaling 238 frames at 1280×720 and 390×844. [Its results](../../tasks/2026-10-01-website-delivery/round5-confirmation/results.json) record scope and per-route hashes for 9034f72a. This is not a fresh visual review of all 31 interior routes. The [Products/Phone/Web review](../../tasks/2026-10-01-website-delivery/round5-confirmation/R5_THREE_ROUTES.md) confirms the corrected Products model and 390px captions, full Phone App controller and compact endings; it identifies the 54px Web continuation addressed by the final repair. The [Research/Schools/Hub review](../../tasks/2026-10-01-website-delivery/round5-confirmation/R5_RESOURCES.md) reports no unresolved defect in its explicitly listed 54 inspected frames. The [homepage graph evidence](../../tasks/2026-10-01-website-delivery/round5-home-confirmation/results.json) confirms the approved graph against that same prior hash.

The earlier 258-view, 41-contact-sheet inspection of all 31 interior openings/next scenes/endings remains historical coverage. Its findings and route ledger are preserved in [INTERIOR_DESIGN_COVERAGE.md](../../tasks/2026-10-01-website-delivery/INTERIOR_DESIGN_COVERAGE.md). Do not carry its visual conclusions onto a different build without confirmation.

Controlled captures permit web fonts and local images while blocking external services; the all-route browser suite also blocks remote fonts. These checks establish local layout, recovery and navigation, not external uptime or physical-device behavior. Earlier live-service observations are historical. The current ce4b5c8c Impeccable scan covers 17 targets and reports 6 primary warnings and 153 design-system advisories; no rules were suppressed. [The scan review](impeccable-review.md) explains the source-regex image warning, retained Lato, inherited base-style findings and non-comparable earlier scope. A detector result is not visual approval.

## Remaining source and release boundaries

Follow-ups for approved host quotations/photo pairings, attribution audit, exact partner-hosted dashboard pages, Phone App naming and research/graphics remain in [JOHN-FOLLOW-UPS.md](JOHN-FOLLOW-UPS.md). No missing answer was replaced with invented facts. Hamilton's private state remains unchanged.

The local library contains 22 distinct community photographs plus 6 smaller derivatives, all 8 original homepage story photos, and installation/workshop images. Optional Box, AD2 and Notion material was authorized. The existing Box tab was located during the earlier source pass, but its contents were not verified because the required browser runtime for that tab was unavailable. No new tab, browser security-setting change or new asset download was performed for that attempt. The local images are not described as newly verified Box files.

Products/Web focused acceptance and the fresh Hub repair confirmation establish the functional base described above. The original Hub failure remains documented in task `visitor-review-final/ba25c54/375-hub-chart-types.png` and `confirmation.json` as resolved historical evidence. No fresh visual inspection of every stop on every route is claimed. The new Stripe-inspired visual brief remains pending. Packaging is on hold; [RELEASE.md](RELEASE.md) describes the local packager, and no corrected release package or deployment is claimed here.
