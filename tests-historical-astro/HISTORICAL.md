# Historical Astro tests — diagnostics only

These tests belonged to the retired Astro static site (replaced by the
React/TanStack site in this change). They are kept unchanged as historical
diagnostics, including the frozen `deployment/reference-manifest.json`
byte-parity manifest. They are **not** current checks: nothing in
`package.json` runs them, and a failure here says nothing about the current
site. Current tests live in `tests/` (Playwright), `src/**/*.test.ts` and
`scripts/**/*.test.mjs` (`npm run test:unit`), plus `npm run test:smoke` for
the production server. Do not regenerate the frozen manifest to make these
pass; an intended new reference needs explicit owner acceptance.
