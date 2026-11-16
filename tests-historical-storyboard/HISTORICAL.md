# Historical storyboard tests — diagnostics only

These Playwright specs describe the site before the 2026 redesign: the full-screen
storyboard home (chapters that stepped on wheel, keys and swipes, the folding hero film,
the chapter dots), the `/who`, `/work` and `/demos` pages (now redirects to
`/implementations`), and earlier layout and copy decisions. They are kept unchanged as a
record of what was agreed then. They are **not** current checks: `playwright.config.ts`
only runs `tests/`, and a failure here says nothing about the current site. Some of them
already failed before the redesign (for example `story-about.spec.ts` expects a preview
button and a `.webp` source the code never had).

Current browser checks live in `tests/`:
- `redesign.spec.ts` — the brochure home, header, product tabs, quotes, demo links,
  and no sideways overflow on a phone;
- `smoke.spec.ts` — every public route loads without errors from this site;
- `visual-review.spec.ts`, `frame-assets.spec.ts`, `admin.spec.ts`.
