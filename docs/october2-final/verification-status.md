# Verification status (in progress)

Current application changes are not final-delivery verified. Candidate1 is under independent cloud-browser review; concrete visual defects are being fixed before candidate2.

## Automated evidence
- Baseline cf2553b:170 Node unit tests passed.
- First expanded aggregate run: Astro check0 errors/0 warnings (7 TypeScript advisory hints),38-page build,195 unit tests, and fixture compilation passed.
- Browser stage did not run successfully. Its first setup failed because configured Playwright Chromium executable is absent. Subsequent sync-API setup errors cascaded from that incomplete startup. An independent normal installed-Chromium attempt encountered socket EPERM. No browser binary installation, security bypass or repeated launch workaround was attempted.
- Three stale source assertions were identified: old To headings, old secondary testimonial link, old homepage CV filter configuration. Updated to final October2 decisions;10 source-only tests now pass. These are not counted as browser interactions.
- Site contracts11/11 pass: routes, local links/assets, original quotes and source copy retained.
- The extra Building policy regression executes actual carousel runtime:18-second initial rotation, contained iframe focus/blur latch, explicit resume. Focus→click and touch→focus→click Pause intent have dedicated regression coverage.

## Performance evidence
WOFF2 derivatives preserve glyph order and horizontal metrics against original TTF files. Six font files total184,396 bytes versus502,604 original TTF bytes (318,208-byte reduction); original TTF fallbacks and licenses retained. This is artifact-byte evidence, not measured load time or Core Web Vitals.

Removed120ms perpetual arrow-layout polling and300ms calendar-layout polling. Existing input/layout events plus coalesced requestAnimationFrame, ResizeObserver and child-content observation now request layout work. No claim of measured interaction latency until supported browser measurements are available.

## External and device limits
Native Building routes815(Harkness),529(Elementary School),1001(Public Library) are verified source applications without the unrelated navigation rail. Public Library electricity chart loaded in source browser; some secondary native charts remain Loading. Route953 is excluded because its source reports a fetch error while old content persists. These external application failures are not disguised as local website success.

Physical touch devices and physical trackpad behavior are not available. Browser wheel/key/resize operations and runtime input simulations must be labeled separately. Cross-origin native application internals cannot be instrumented by this frontend. Full controller/display pairing requires observing an actual controller action in the available browser.
