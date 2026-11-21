# Site editor (CMS)

Maddie and John can change the site's words, links, pictures, lists and sections from a private editor on its own address. Plain text only: nothing typed is ever treated as HTML or CSS, and the layout stays fixed.

## How it works

- Every editable string has a permanent key made from where it lives in the code, for example `orbBeats.0.frames.1.caption`. `src/lib/site-registry.ts` lists the content; keys are found automatically.
- The code holds the original text. Edits are stored in the database (`cms_content`) and merged over the original on the server before the page is drawn, so there is no flash of old text.
- Every save writes a row to `cms_revisions` (who, what, when, old value, new value). Any revision, or the original, can be restored from History.
- Pictures: replace any picture; a description (alt text) is required. jpg, png or webp only (no SVG), checked by file content, 4 MB limit. The original stays available as "Use the original".
- Lists (lessons, publications, case studies, voices, pricing tiers, design services, FAQ, home stories, the team on About, orb/engage/educate/motivate frames): add, remove, reorder. A new item copies the layout of the first item.
- Sections (11 of them, such as Supporters, Questions, Results): hide or show.
- A warning appears when text is much longer than the original (about 1.3 times plus 12 characters).
- Edits show on the public site at once on Vercel: pages are cached for 1 minute (refreshing in the background for a day; it was 5 minutes until 2026-11-21, shortened so an editor sees a change quickly), and every save purges that cache (tag `cms`, via `@vercel/functions`). The purge only runs on Vercel and has not been exercised yet; if it ever fails, edits still show within 5 minutes.
- If the code changes after someone edited it (new wording, or an item inserted into a list), the edit is not applied to the wrong place: it is set aside, the original shows, and the editor marks it "Out of date" so it can be saved again. Each edit stores a fingerprint of the default it was made against (`migrations/0002_cms_def_hash.sql`); lists also follow items by `id` when the code only reorders them. Edits saved before that migration keep applying. Those rows (no fingerprint) apply by position and are not protected against code changes; Neon had no edits when 0002 was added, so none exist there. Fingerprints of list items are taken from a copy of the defaults made at startup, so editing text never changes them. Reverting a list keeps the item identities it was saved against, so an old order is flagged "Out of date" if the code list has since changed.
- If the database is slow or down, public pages wait about 1 second, then use the last good edits (or the built-in text if there were none), so a database blip never breaks a page. Known small race: the page content is shared inside one server process, so a page rendering at the exact moment new edits load can show them one load early and the browser redraws it once.

## Environment variables

| Name | Where | What it does |
|---|---|---|
| `ADMIN_EMAILS` | Vercel (set) and `.env.local` | Comma separated. Only these addresses are sent a sign-in code. Currently the founder (two addresses), John and Maddie. |
| `ADMIN_HOST` | Vercel (set: `editor.communityhb.tech` on the editor project) and `.env.local` | Host the editor lives on, for example `editor.communityhb.tech`. Locally `admin.localhost:8123`. Unset in production means the editor is off. |
| `POSTMARK_SERVER_TOKEN`, `POSTMARK_FROM` | Vercel, both projects (not set yet: needs a token from Gaurav) | Sends the sign-in codes and the contact form through Postmark, the service the organisation already sends `mail@communityhub.cloud` with. Preferred: that mail reaches Oberlin inboxes. Sender defaults to `Community Hub <mail@communityhub.cloud>`. |
| `RESEND_API_KEY`, `MAIL_FROM` | Vercel (set on both projects) | The fallback when there is no Postmark token. Its sender is `website@communityhb.tech`, a domain registered in October 2026. **Oberlin's mail system removes mail from that domain after accepting it** (found 2026-11-21: Resend showed two sign-in codes "delivered" to an oberlin.edu address; the mailbox held nothing, not in spam or trash), so on Resend alone John, Maddie and the dashboard inbox receive nothing. Gmail.com inboxes do receive it. |
| `BETTER_AUTH_SECRET` | Vercel (set, hidden) and `.env.local` | 32+ characters; signs sessions. |
| `DATABASE_URL` | Vercel (set) | Hosted Postgres (Neon). Unset locally: an in-memory pglite database is used. |
| `BLOB_READ_WRITE_TOKEN` | Vercel (Production, set by the Blob store) | Picture uploads. Unset locally: pictures go to `.cms-media/` (or `CMS_MEDIA_DIR`). |

## Cloud setup status (checked 2026-11-21)

Two Vercel projects in team Community Hub run the same code against the same database:

- **`communityhub-cloud`: the public site** (www.communityhub.cloud). Connected to GitHub (`Community-Hub/communityhub.cloud`, branch `master`), so every merge deploys it. It has no `ADMIN_HOST`, so it serves no editor: `/admin` and `/api/cms*` answer 404 there.
- **`community-hub-site`: the editor** (https://editor.communityhb.tech, `ADMIN_HOST=editor.communityhb.tech`). The domain `communityhb.tech` is registered with Vercel, so no outside DNS record is needed. Since 2026-11-21 it is connected to the same GitHub repository and branch as the public site, so every merge to `master` deploys both and the editor always lists the words of the build that is live. (Before that it was deployed by hand and had fallen behind, still on the 2026-11-12 build.)
- Both read the same Neon database (`DATABASE_URL` is identical) and sign sessions with the same `BETTER_AUTH_SECRET`, so an edit saved in the editor is what the public site reads. `ADMIN_EMAILS` (four addresses), `RESEND_API_KEY` and `MAIL_FROM` are set on the editor project. `ADMIN_SIGNUP_CODE` is still set there from the password days; nothing reads it any more and it can be deleted. Each project has its own Blob store token; pictures uploaded in the editor are public Blob addresses, which the public site accepts.
- **The editor must run the same build as the site.** It lists the words of the build it was deployed from; on an older build it shows old defaults, and an edit made against them is set aside as "Out of date" on the public site. The shared GitHub connection keeps them together: if a merge deploys one project and not the other (a failed build), redeploy the one that is behind.
- Pull requests build a preview on both projects. The editor project's preview builds run the migrations against the shared database, so a pull request that adds a migration applies it there before it is merged.
- The cache purge on save runs in the editor's project. Whether it reaches the public project's cache has not been checked; if it does not, edits show on the public site after about a minute (the first visit after that minute still gets the old page and starts the refresh; the next one gets the new wording).

## Giving someone access

1. Check their address is in `ADMIN_EMAILS` on the editor project (`community-hub-site`); redeploy if you change it.
2. Send them https://editor.communityhb.tech. There is nothing else to send: no password, no code from you.
3. They type their email address, receive a 6-digit code by email, and type it in. The first time also creates their account. They stay signed in on that browser for a week.

Result: `editor.communityhb.tech` serves only the editor (`/` goes to `/admin`). Cookies belong to the editor host only (host-only, httpOnly, SameSite strict, Secure).

## Adding Maddie and John

They are already on `ADMIN_EMAILS` (as `john.petersen@oberlin.edu` and `mfaubert@oberlin.edu`; the address must match exactly). To add or remove anyone: edit `ADMIN_EMAILS` in Vercel and redeploy (sessions are checked against the list on every request, so removal takes effect immediately after the redeploy). Each person then opens the editor address and signs in with a code sent to their email.

## Security notes

There are no passwords (the owner's choice, 2026-11-21): a listed address is emailed a 6-digit code, and reading that mailbox is the proof. The code works for 10 minutes and for 5 tries, is stored hashed, and is never logged when live; a new code cancels the old one. A signed-in browser stays signed in for 7 days, not extended by use, then needs a new code. Only listed emails are sent a code; anyone else is told the address cannot use the editor. Asking for a code and using one are each limited to 5 a minute per IP address (taken from `x-forwarded-for`, which is only trustworthy on Vercel, so the app must stay hosted on Vercel); everything else the sign-in library offers (passwords, password reset, changing an address) answers 404; cookies are secure and host-only; writes need a matching Origin (CSRF); everything is stored as plain text and escaped when drawn; links must be `/path`, `#`, `https://`, `http://`, `mailto:` or `tel:`; image URLs must be the original, a stored upload or this project's Blob store; the editor host sends `no-store`, `X-Frame-Options: DENY`, `X-Content-Type-Options: nosniff`, a Content Security Policy with `frame-ancestors 'none'`, and `noindex` (the public site is unchanged); the path is lower-cased and decoded before the host check, so `/Admin` and `/%61dmin` are 404 on the public host; uploads are cut off at 4 MB while streaming; outside `NODE_ENV` development or test the editor refuses to run without `ADMIN_HOST` and a 32+ character `BETTER_AUTH_SECRET`.

## Running locally

```
npm install
npm run dev -- --port 8123          # site: http://127.0.0.1:8123   editor: http://admin.localhost:8123/admin
```

`.env.local` (git-ignored) needs `ADMIN_EMAILS`, `ADMIN_HOST=admin.localhost:8123`, `BETTER_AUTH_SECRET`. With no `RESEND_API_KEY` locally, the sign-in code is printed in the terminal instead of emailed (set `CMS_OTP_OUTBOX` to a folder to have it written there, as the tests do). Without `ADMIN_HOST`, dev serves the editor at `/admin` on any host. Do not run `vercel env pull` or `vercel blob create-store` in this folder without a backup: they overwrite `.env.local`.

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
