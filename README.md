# Community Hub website

The communityhub.cloud website: React + TanStack Start (file routes in
`src/routes/`), built with Vite and Nitro. This replaced the previous Astro
static site; that runtime's tests and scripts are kept unchanged under
`tests-historical-astro/` and `scripts-historical-astro/` as historical
diagnostics (see `tests-historical-astro/HISTORICAL.md`), and older docs
under `docs/` describe their dated versions.

## Run locally

Use Node 22 or newer.

```sh
npm ci
npm run dev        # http://127.0.0.1:8080/
```

## Production

The production runtime is a Node server (Nitro `node-server` preset), not a
static file host:

```sh
npm ci
npm run build      # writes .output/ (NITRO_PRESET defaults to node-server)
npm run start      # NODE_ENV=production node .output/server/index.mjs, port $PORT (8080 in Docker)
```

Or with Docker (port 8080, `GET /healthz` → `ok`):

```sh
docker build -t communityhub-website .
docker run -p 8080:8080 communityhub-website
```

Deployment names, port and health path are declared in `ch.production.json`
(unchanged from the static site). Vercel remains available as an explicit
alternative: `npm run build:vercel` (sets `NITRO_PRESET=vercel`;
`vercel.json` does the same).

### No database required

The public website renders entirely from built-in content with no database:
with `DATABASE_URL` unset in production, `src/lib/db.ts` refuses database
access and the CMS state loader falls back to the built-in text. Nothing in
the container writes to disk, so it can run read-only. The optional CMS
editor (see `CMS.md`) stays opt-in: it needs `DATABASE_URL` plus
`ADMIN_HOST`, `ADMIN_EMAILS`, `ADMIN_SIGNUP_CODE` and `BETTER_AUTH_SECRET`.
With `ADMIN_HOST` unset, production serves no editor at all (`/admin` and
`/api/cms*` answer 404 on the public host); relaxed local behavior requires
an explicit `NODE_ENV=development` or `test`.

### Legacy URLs

Old `.html` pages and WordPress paths 301-redirect to the current routes,
preserving query strings. The map lives in `src/lib/legacy-redirects.ts`
(mirrored in `deployment/legacy-redirects.json`, kept in sync by a test) and
is applied by the request middleware in `src/start.ts` before any rendering.
`/sitemap.xml` lists the current public routes.

Pages whose content moved rather than matching one-to-one: old case-study
pages (GLSC, Midtown, Oberlin, schools) land on their pages under
`/implementations/`; `/who`, `/work`, `/demos` and the audience directories
land on `/implementations`; `contact.html` / `contact-us` land on `/contact`;
`environmental-dashboard` lands on `/`. The old `404.html` has no
counterpart; unknown paths render the app's not-found page.

## Design

The 2026 redesign is documented in `DESIGN.md` (tokens and rules) with its
machine-readable extensions in `.impeccable/design.json`; `PRODUCT.md` holds
the audiences, positioning and constraints. Pages read like a presentation:
each section is one full screen that snaps into place (`.deck` / `.page` /
`.page-fill` in `src/styles.css`; the home's components are in
`src/components/home.tsx`). `/lorawan` and `/studios` are Educate products.

## Contact form and demo bookings

`/contact` sends messages and demo bookings through `POST /api/contact`, which
emails them with Resend to the inbox in `site.formInbox` (`src/lib/site.ts`,
editable in the CMS). It needs `RESEND_API_KEY`; `MAIL_FROM` sets the sender
(default `website@communityhub.cloud`). Without a key the form explains the
problem and offers the email address instead. `/contact?mode=demo` opens the
booking form; `/contact?topic=…` pre-fills a topic.

## Tests

```sh
npm run typecheck
npm run test:unit    # node:test suites in scripts/ and src/ (incl. legacy redirects)
npm run test:smoke   # builds, boots .output with no DATABASE_URL, checks pages/healthz/redirects
npm test             # unit tests + Playwright (tests/, needs a dev server per playwright.config.ts)
```

## Source structure

| Location | Responsibility |
| --- | --- |
| `src/routes/` | File routes: public pages, `/admin`, CMS APIs, `/sitemap.xml` |
| `src/start.ts` | Request middleware: `/healthz`, legacy redirects, CMS host gate |
| `src/lib/legacy-redirects.ts` | Legacy URL map + health response |
| `src/lib/cms/`, `src/lib/db.ts` | Optional CMS and its database access (opt-in) |
| `public/` | Original-resolution site assets, served as-is |
| `migrations/` | CMS schema, applied only when `DATABASE_URL` is set at build/deploy |
| `deployment/legacy-redirects.json` | Machine-readable copy of the redirect map |
