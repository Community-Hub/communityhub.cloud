# Site editor (CMS)

Maddie and John can change the site's words, links, pictures, lists and sections from a private editor on its own address. Plain text only: nothing typed is ever treated as HTML or CSS, and the layout stays fixed.

## How it works

- Every editable string has a permanent key made from where it lives in the code, for example `orbBeats.0.frames.1.caption`. `src/lib/site-registry.ts` lists the content; keys are found automatically.
- The code holds the original text. Edits are stored in the database (`cms_content`) and merged over the original on the server before the page is drawn, so there is no flash of old text.
- Every save writes a row to `cms_revisions` (who, what, when, old value, new value). Any revision, or the original, can be restored from History.
- Pictures: replace any picture; a description (alt text) is required. jpg, png or webp only (no SVG), checked by file content, 4 MB limit. The original stays available as "Use the original".
- Lists (lessons, publications, case studies, voices, pricing tiers, design services, FAQ, home stories, orb/engage/educate/motivate frames): add, remove, reorder. A new item copies the layout of the first item.
- Sections (11 of them, such as Supporters, Questions, Results): hide or show.
- A warning appears when text is much longer than the original (about 1.3 times plus 12 characters).
- Edits show on the public site at once on Vercel: pages are cached for 5 minutes (refreshing in the background for a day), and every save purges that cache (tag `cms`, via `@vercel/functions`). The purge only runs on Vercel and has not been exercised yet; if it ever fails, edits still show within 5 minutes.
- If the code changes after someone edited it (new wording, or an item inserted into a list), the edit is not applied to the wrong place: it is set aside, the original shows, and the editor marks it "Out of date" so it can be saved again. Each edit stores a fingerprint of the default it was made against (`migrations/0002_cms_def_hash.sql`); lists also follow items by `id` when the code only reorders them. Edits saved before that migration keep applying. Those rows (no fingerprint) apply by position and are not protected against code changes; Neon had no edits when 0002 was added, so none exist there. Fingerprints of list items are taken from a copy of the defaults made at startup, so editing text never changes them. Reverting a list keeps the item identities it was saved against, so an old order is flagged "Out of date" if the code list has since changed.
- If the database is slow or down, public pages wait about 1 second, then use the last good edits (or the built-in text if there were none), so a database blip never breaks a page. Known small race: the page content is shared inside one server process, so a page rendering at the exact moment new edits load can show them one load early and the browser redraws it once.

## Environment variables

| Name | Where | What it does |
|---|---|---|
| `ADMIN_EMAILS` | Vercel (set) and `.env.local` | Comma separated. Only these may sign up or sign in. Currently the founder (two addresses), John and Maddie. |
| `ADMIN_HOST` | Vercel (set: `admin.communityhub.cloud`, Production and Preview) and `.env.local` | Host the editor lives on, for example `admin.communityhub.cloud`. Locally `admin.localhost:8123`. Unset in production means the editor is off. |
| `ADMIN_SIGNUP_CODE` | Vercel (set, Production and Preview) and `.env.local` | A shared code needed to create an account (header `x-cms-signup-code`). Must be at least 16 characters; if shorter or missing, sign-up is refused. Share it privately with each person. |
| `BETTER_AUTH_SECRET` | Vercel (set, hidden) and `.env.local` | 32+ characters; signs sessions. |
| `DATABASE_URL` | Vercel (set) | Hosted Postgres (Neon). Unset locally: an in-memory pglite database is used. |
| `BLOB_READ_WRITE_TOKEN` | Vercel (Production, set by the Blob store) | Picture uploads. Unset locally: pictures go to `.cms-media/` (or `CMS_MEDIA_DIR`). |

## Cloud setup status

- Vercel project `community-hub-site` (empty, nothing deployed) in team Community Hub.
- Blob store `community-hub-media` (public reads, attached to that project).
- Env set on the project: `ADMIN_EMAILS`, `BETTER_AUTH_SECRET`, `ADMIN_HOST` (`admin.communityhub.cloud`), `ADMIN_SIGNUP_CODE` (Production and Preview); `BLOB_READ_WRITE_TOKEN` (Production).
- Database: Neon `community-hub-db` (free plan) is created and connected to `community-hub-site`; `DATABASE_URL` and `POSTGRES_URL` are set for Production and Preview. The migrations (`migrations/0001_cms.sql`, `0002_cms_def_hash.sql`) run automatically at build.
- Domain `admin.communityhub.cloud` is added to the project; only the DNS record is pending (see below).
- Nothing has been deployed or pushed, and no DNS or Vercel domains were changed.

## Putting the editor on its own address (founder approves first)

Founder to-dos left:

1. At DigitalOcean DNS add a CNAME: name `admin`, value `cname.vercel-dns.com` (the domain is already added to the project and `ADMIN_HOST` / `ADMIN_SIGNUP_CODE` are already set).
2. Deploy (after you approve) so the new env values take effect.
3. Each person creates their account with the sign-up code, which you share privately.
Result: `admin.<site domain>` serves only the editor (`/` goes to `/admin`); the public host answers 404 for `/admin` and `/api/cms*`. Cookies belong to the admin host only (host-only, httpOnly, SameSite strict, Secure).

## Adding Maddie and John

They are already on `ADMIN_EMAILS`. To add or remove anyone: edit `ADMIN_EMAILS` in Vercel and redeploy (sessions are checked against the list on every request, so removal takes effect immediately after the redeploy). Each person then opens the admin address, chooses "First time? Create your account", and enters their email, a password of 12+ characters and the sign-up code. No emails are sent by the system; send the address and code yourself.

## Security notes

Only listed emails can sign up or in; sign-in is limited to 5 tries a minute and sign-up to 5 per five minutes per IP address (taken from `x-forwarded-for`, which is only trustworthy on Vercel, so the app must stay hosted on Vercel); cookies are secure and host-only; writes need a matching Origin (CSRF); everything is stored as plain text and escaped when drawn; links must be `/path`, `#`, `https://`, `http://`, `mailto:` or `tel:`; image URLs must be the original, a stored upload or this project's Blob store; the editor host sends `no-store`, `X-Frame-Options: DENY`, `X-Content-Type-Options: nosniff`, a Content Security Policy with `frame-ancestors 'none'`, and `noindex` (the public site is unchanged); the path is lower-cased and decoded before the host check, so `/Admin` and `/%61dmin` are 404 on the public host; uploads are cut off at 4 MB while streaming; outside `NODE_ENV` development or test the editor refuses to run without `ADMIN_HOST` and a 32+ character `BETTER_AUTH_SECRET`.

## Running locally

```
npm install
npm run dev -- --port 8123          # site: http://127.0.0.1:8123   editor: http://admin.localhost:8123/admin
```

`.env.local` (git-ignored) needs `ADMIN_EMAILS`, `ADMIN_HOST=admin.localhost:8123`, `ADMIN_SIGNUP_CODE`, `BETTER_AUTH_SECRET`. Without `ADMIN_HOST`, dev serves the editor at `/admin` on any host. Do not run `vercel env pull` or `vercel blob create-store` in this folder without a backup: they overwrite `.env.local`.

## Tests

- `npm run test:unit` (merge logic, validation, revision history, allowlist, host gate, images).
- `CMS_TEST_PORT=8124 npx playwright test` runs the whole site suite (including `fit-screens`) and then `tests/admin.spec.ts` (edit appears on the page, non-listed email refused, revisions, pictures with alt text, lists, sections, links). They use pglite and a temp media folder, never the hosted database.
- `npm run typecheck`.

## Not editable yet

- Chapter and school names (`CHAPTERS`, `SCHOOLS_NAME`), embed and iframe URLs, aria and iframe titles built in code, the `{count}` placeholder in the toolkit intro.
- The small "Post it" cards in digital signage, the Story slide set (`ORIGINAL_SLIDES`), the voices filters and embeds data.
- Hiding: the digital-signage sections, home chapters and product-page slides cannot be hidden (only the 11 listed sections).
- Items you add to a list cannot have their words edited afterwards (remove and add again). Strings copied from the home beats into "Who it's for" are separate slots.
- The Blob check accepts any Vercel Blob address, not only this store.
