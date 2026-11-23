# Working on the Community Hub website

This repository is the communityhub.cloud website and its editor. Read these first:

- `README.md`: running, building, testing and deploying the site.
- `PRODUCT.md`: who the site is for, what it sells, and the facts and evidence it may use.
- `DESIGN.md`: the look and its rules (machine-readable extensions in `.impeccable/design.json`).
- `CMS.md`: the editor at editor.communityhb.tech and how the site's wording is stored.
- `docs/editing-the-site.md`: the editor guide for John and Maddie.

The project's current state, open tasks and handoff live in Relay (project `community-hub-website`). Older documents are described in `docs/README.md`.

## How changes ship

- Work on a branch and open a pull request against `master` on `Community-Hub/communityhub.cloud`. A merge to `master` deploys both Vercel projects: the public site (`communityhub-cloud`) and the editor (`community-hub-site`). Merge only with the owner's OK.
- Pull requests build a preview on both projects. The editor project's preview runs the database migrations against the shared production database, so a pull request that adds a migration applies it before it is merged.
- The editor must run the same build as the public site. If a merge deploys one project and not the other, redeploy the one that is behind.

## Rules for the code

- **Every visible word must be editable.** Wording lives in the content modules (`src/lib/copy.ts`, `page-content.ts`, `content.ts`, the data files) or in `src/lib/page-text/<name>.ts`. Read it when drawing (`txt.heading1`), never copy it into a constant; for a constant list use a getter. A new `page-text` file must be added to `src/lib/page-text/all.ts`.
- **Stay true.** No invented claims, prices, customers, quotes or awards; `PRODUCT.md` lists the evidence on hand. Keep the original site's writing, quotations with their attribution, real photographs and live examples.
- **Old addresses keep working.** `src/lib/legacy-redirects.ts` and `deployment/legacy-redirects.json` must stay in sync (a test checks).
- **Stay on Vercel.** Editor sign-in rate limits trust `x-forwarded-for`, which is only reliable there, and the cache purge uses `@vercel/functions`.
- **Keep the dev server contract:** `0.0.0.0:8080` (see `vite.config.ts`).
- Do not run `vercel env pull` or `vercel blob create-store` in this folder without a backup: they overwrite `.env.local`.

## Kwaku's process for design and UI work

These instructions come from the owner and are carried over from the October 2026 version of this file. Ask the owner before dropping any of them.

- **Before each design or UI task,** read two relevant primary design sources (starting points: [Impeccable](https://impeccable.style/slop/), [Anthropic frontend design](https://github.com/anthropics/skills/blob/main/skills/frontend-design/SKILL.md), [NN/G](https://www.nngroup.com/articles/aesthetic-minimalist-design/)), inspect the current rendered page, and note a few specific patterns to avoid. Use the Impeccable skill and read its craft floor right before UI edits. Keep the research short, then do the work.
- **Nothing may cover anything.** No icon, caption or control may cover text, essential image content or another control; real controls get their own layout space. Treat accidental overlap as a blocker.
- Keep direct links, native controls, reduced motion, keyboard access and real wheel and touch navigation working.
- Reuse the browser tabs that are already open; do not open new visible tabs.
- Check affected desktop and phone views against the actual build.
- **After every build, before handing off,** ask another agent for an independent first-time-visitor critique of the rendered work: what a visitor understands, what to do next, visual noise, and whether interactions behave as expected. Record the build you tested, fix concrete findings together, and confirm the fixes. Passing automated checks alone does not meet this bar, and the review is not a licence to start a new redesign.
- Do not deploy while a coordinated review is still pending.

## Checks before handing off

```sh
npm run typecheck
npm run test:unit
npm run test:smoke
CMS_TEST_PORT=8124 npx playwright test   # for UI or editor changes
```

## History

`docs/history/AGENTS-2026-10.md` holds this file as it was for the October Astro version. Its visual direction (the eight-colour dashboard palette, Lato type, full-field backgrounds, a continuous pale surface, the attention squirrel) was replaced when the owner chose the current design on 2026-11-15; `DESIGN.md` is the authority now.
