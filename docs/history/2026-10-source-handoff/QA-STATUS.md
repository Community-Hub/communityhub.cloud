# Community Hub — October 2 navigation revision

## Accepted candidate

The reopened swipe/navigation defects are repaired and independently accepted. The source preserves the accepted original Story of Dashboard replacement and all 35 content routes plus 3 redirects. All 630 current public files remain byte-for-byte unchanged from the prior accepted handoff, including all 597 supplied originals.

The final private preview is version 23, source commit `d9596eeb8197397ccadf7419420280d2372ed1fb`. The tested bundle is `KpN3kooo.js`. The production candidate was built at 2026-10-02 19:51:15 UTC; `index.html` SHA-256 is `756d92cd5f5998aec292a91bf19c7016a2d69cdb4eaedab7e8777a7335186991`. All 675 production files are recorded in `docs/refinement-20261002/final-build-manifest.json`.

This is an owner-only private preview, not a public deployment. The GitHub source commit is separate from the preview’s commit and is verified by the repository handoff process.

## What changed

- Deliberate opposite wheel input can cancel the prior direction promptly. Continuing momentum and tiny sign jitter do not skip another scene. A fresh gesture no longer waits for an extra 450ms hold, and an outward attempt at either boundary does not block returning.
- Narrow vertical navigation now visits every product within Engage, Educate and Motivate in the same order, with exact reverse traversal. Complete copy/media reading frames remain reachable; visitors do not have to exhaust examples before moving to another product.
- Resizing preserves the selected product through a semantic panel anchor. Closing the mobile menu restores the original visible story after scrollbar/layout changes.
- The brief Web Embeddables example uses current Cleveland calendar events through the site’s existing live-feed component. Scrolling over these event rows remains page navigation. The complete native calendar remains on its detailed page. Building retains its explicit internal scroll-through canvas and native controls.
- Redundant normal-state homepage demo links are hidden. The product action, chart help, native controls, screen-reader status and detailed-page recovery/source actions remain. Empty calendar data and network failure have distinct truthful states.

The final meeting agreement, root causes and implementation contracts are documented in `docs/refinement-20261002/swipe-revision.md`. No gesture thresholds are attributed to the meeting; they are engineering heuristics.

## Automated verification

The final source independently passes:

- Astro/TypeScript: 78 files, 0 errors, 0 warnings, 7 informational hints
- Production build: 38 HTML outputs
- Node tests: 170 passed, 0 failed
- Route, asset, fragment, privacy and original-copy contracts: 11 passed
- Browser fixtures: 26 TypeScript bundles and 47 stylesheets compiled
- Changed Python browser tests compile successfully

Current check, unit and contract logs are under `docs/refinement-20261002/swipe-*.log`. The automated browser suite itself was not executed in this environment. Historical migration-parity checks require an optional reference checkout absent from the supplied archive.

## Actual rendered and interactive review

On the confirmed V21–V23 private builds, the review exercised:

- Complete forward and reverse narrow product order across categories, direct product tabs, reading continuations and previous-category entry
- Repeated opposite wheel inputs about 104–109ms apart, a continuous 1.08-second stream, suppression of a 188ms repeat and rearming after 332ms of quiet input
- First/last boundaries, native Building Dashboard scrolling and page wheel input over real Cleveland event rows
- Selected Web/Phone preservation from narrow to desktop and back, including media continuation; a settled593px intermediate width
- Building → Menu → Tab/Down → Escape, and normal menu destination navigation
- Accepted combined opening and its continuation, form editing keys, tall-directory tail, example-only carousel controls, and original Products slide keyboard navigation

The current navigation retakes used resized desktop Chrome around 504×757,593×757 and1173×757 CSS pixels at 100% zoom. They are actual browser checks. Physical trackpad momentum/contact phases and touch hardware were not available; handler event-trace tests are not represented as physical-device tests.

The prior accepted review covered all 35 desktop route scene walks, all 35 narrow initial views, source-matched assets and targeted repairs. That historical evidence remains relevant to unchanged areas; this scoped revision did not repeat all earlier page captures. The original 31-slide Products viewer was previously accepted at desktop, short-laptop and 390×606 narrow sizes and was smoke-tested again here. Full frames, captions, quiet controls and the official-source/full-size actions remain intact.

Cached pre-update HTML and screenshots captured during an unfinished resize were excluded from final acceptance. No known local defect remained in the observed final checks.

## External and coverage limits

- Public applications, calendars, controllers, Community Voices and lesson PDFs require their source hosts and internet access. A load event alone is not an upstream health guarantee.
- The original YouTube player and source watch page previously remained buffering in this cloud browser. Local loading/layout behavior was verified; remote video playback is not claimed.
- Original presentation text remains inside 960×720 source images. Their full-size action supports closer reading.
- Narrow portrait Voices and native applications can require genuine internal scrolling to retain readable content; the Building-only special canvas contract does not remove native menus, form controls or necessary long-resource reading.
- Physical phones, touch hardware, Safari and Firefox were not tested. No exhaustive cold-cache trace, every external-app state or every link traversal is claimed.
- Contact/email preparation was reviewed without sending a message; this website report makes no delivery claim.

## Source handoff

Both ZIPs merge into the same `community-hub-source/` folder. The media ZIP is unchanged from the prior handoff. Run `python3 verify-source.py` on the clean merged extraction before installing dependencies, then use Node 22.12 or newer with `npm ci`, `npm run check`, `npm run build` and `npm run preview -- --port 4327`. See `README.md`, `HANDOFF.md` and the maintainer guide for complete instructions.

## October 3 Kwaku review fixes
- Verified in the browser (390x844 and 1440x900, one overlap scan per frame over 35 phone pages and the 6 desktop pages named in the review): last frame of every scene is clear of the circle; remaining hits are first or middle frames that the next stop re-shows (for example /products s0 at 1440, /pricing s5 at 390).
- Home 390: circle on at every stop through Community Voices, off on the footer; Calendar preview has 0 `.sp-nav`; Explore is `A.hv-next` (724-772) above the circle (790-834); the post-Explore opening ends at 844 with controls at 739-783 and stops at 0 and 767.
- /who-its-for 390: first screen has the page title and "Communities" only. Contact, /pricing, /who-its-for: circle on at the last content frame, off at the footer.
- Automated: build 38 pages OK; `node --test tests/*.test.mjs` 237 pass, 0 fail; `npm run -s test:contracts` 11 OK.
- Remaining: `tests/browser/test_ui_foundation.py` was updated for the visible contact circle but not run (needs Playwright); /digital-signage TV finding not reproduced.
