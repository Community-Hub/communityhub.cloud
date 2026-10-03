# Homepage video entry

Entry fix, October 1, 2026. Preserve the existing Experience direction.

Research: [NN/G minimalist design](https://www.nngroup.com/articles/aesthetic-minimalist-design/) and [W3C On Focus](https://www.w3.org/WAI/WCAG22/Understanding/on-focus.html). Avoid unexpected entry jumps, repeated delayed scroll resets that override visitor input, and blanket resets that break fragment destinations or browser Back.

Observed the existing browser at index.html showing Who we are with its opening video paused at 4.4 seconds, not ended. Fresh isolated visits start correctly. Reload regression reproduces native restoration to a later scene. Suppress native restoration only during ordinary unfragmented homepage entry; preserve history navigation and restore normal browser behavior after pageshow. No layout or content changes.

Implementation: homepage-only inline startup guard in `src/layouts/PageLayout.astro`. Runs before body/module layout, resets to zero synchronously, holds manual restoration through the initial pageshow paint, then restores the prior mode. No delayed scroll resets, event interception, or video changes. Fragment and Back/Forward visits bypass the guard.

Final build: October 1, 21:17:34 local. `dist/index.html` SHA-256 `7397c86187b14f0625eac35d977546407ab849113f01db16be0790992da43546`. Typecheck: zero errors/warnings, seven existing hints. Build:38 pages. Dev regression changed from failing at643px desktop /767px phone to passing after the fix. Existing in-app browser reload verified the opening video section.

Verification: all9 Chromium startup tests pass on the production build, including direct links, reduced motion, native scroll and menu focus. Independent desktop/phone visitor review passed; see `home-video-start-review.md` and its screenshots. Initial shared-output run encountered a transient absent runtime; repeated against stable output with unchanged index hash. WebKit homepage reload/logo passes; initial Back assertion was inconsistent (1330px instead of643px), while a control run without the guard and the subsequent unchanged-build confirmation restored643px correctly. This is recorded as intermittent browser-test behavior rather than proof of exhaustive Safari coverage.
