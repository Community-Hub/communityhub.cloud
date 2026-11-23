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
- Edits show on the public site at once on Vercel: pages are cached for 1 minute (refreshing in the background for a day; it was 5 minutes until 2026-11-21, shortened so an editor sees a change quickly), and every save purges that cache (tag `cms`, via `@vercel/functions`). The purge only runs on Vercel. The owner checked on 2026-11-23 that a real edit made in the editor shows on the public site; if the purge ever fails, edits still show within about a minute.
- If the code changes after someone edited it (new wording, or an item inserted into a list), the edit is not applied to the wrong place: it is set aside, the original shows, and the editor marks it "Out of date" so it can be saved again. Each edit stores a fingerprint of the default it was made against (`migrations/0002_cms_def_hash.sql`); lists also follow items by `id` when the code only reorders them. Edits saved before that migration keep applying. Those rows (no fingerprint) apply by position and are not protected against code changes; Neon had no edits when 0002 was added, so none exist there. Fingerprints of list items are taken from a copy of the defaults made at startup, so editing text never changes them. Reverting a list keeps the item identities it was saved against, so an old order is flagged "Out of date" if the code list has since changed.
- If the database is slow or down, public pages wait about 1 second, then use the last good edits (or the built-in text if there were none), so a database blip never breaks a page. Known small race: the page content is shared inside one server process, so a page rendering at the exact moment new edits load can show them one load early and the browser redraws it once.

## Editing on the page

On the editor's address a signed-in editor sees the site itself and clicks wording to change it where it sits (the owner, 2026-11-21: the editor should look like the site, so people know what they are editing and how it will look).

- After sign-in the editor lands on `/`, the site's home, on the editor host. `/admin` is still the full list (words, pictures, lists, show or hide, history); a bar at the bottom of every page links to it, and it links back.
- **Who can open the site's pages there.** The gate lets a request through to the site's own pages on the editor host only when it carries the editor's session cookie; without it `/` goes to `/admin` and every other page is 404, as before. The cookie is only looked for at the gate. The on-page tools then check the session and send anyone not signed in to `/admin`, and every read or write of editor data checks the session itself, as always.
- **Never cached, relaxed frames.** Every response on the editor host is `no-store`, so a page drawn for an editor is never handed to anyone else. The site's pages there get their own Content Security Policy that allows the frames, pictures and film the public pages show; `/admin` and the editor API keep the strict one.
- **How a click finds the right entry.** The on-page tools (`src/components/admin/page-editor.tsx`) are loaded only on the editor host. In that browser only, each editable wording gets an invisible tag at its end (three kinds of zero-width character that cannot move a line break) saying which entry it is, and the page redraws once. Text carrying a tag is that entry exactly, so the heading "Pricing" and a menu item that also says "Pricing" are told apart. Text the page's code reshapes loses its tag; that falls back to matching what it says, and when the same words are used in several places the editor chooses which. The tags never reach the server, the database or the public site (a test checks the public page has none).
- **After a save** only the text carrying that entry's tag changes on screen; if that cannot be done in place the page redraws itself from its content. The public site shows it after about a minute.
- Pictures, lists, hiding sections and history are changed in the list at `/admin`, not on the page. The owner decided on 2026-11-23 to keep it that way.

## Bold and italic

Asked for by John Petersen on 2026-11-22, to see the mission statement in italics. The card on the page has a **B** and an **I** button and shows the wording as it will look: select words and press one, or press one with nothing selected to change the whole wording.

- **What is saved** is the text with `<b>...</b>` around bold words and `<i>...</i>` around italic ones (`<strong>` and `<em>` are read as the same and saved as `<b>` and `<i>`). That is also what the list at `/admin` and the history show, and it can be typed there. Nothing else in angle brackets means anything: it is escaped and shown as typed, as before.
- **What the page holds while it draws** is the plain text with one invisible character where bold switches on or off and another for italic (`src/lib/cms/marks.ts`). The content index puts them there when it applies an edit.
- **How it is drawn.** The build makes every element of the site's own pages through `src/lib/jsx` (`jsxImportSource: "site-jsx"` in `vite.config.ts`). Where a string with marks is among an element's children it becomes `<strong>` and `<em>`; in an attribute that is read rather than drawn (a picture description, a button's name) the marks are taken out. So no page or component has to do anything to show formatting, and text with no marks, which is nearly all of it, is passed on untouched.
- **Why invisible marks.** Pages pass wording around as plain strings: into a heading, but also into the browser tab title, the address of a section, a search, code that cuts a sentence in two. A visible mark could turn up on screen as stray symbols; an invisible one is either drawn as formatting or does nothing. Tab titles and descriptions for search engines have the marks taken out in `src/router.tsx`, and mail sent by the forms in `mail.server.ts`. A test checks a visitor's page holds none of these characters.
- **Saving cleans up.** The site's own invisible characters are stripped from everything saved, so text copied off a page of the editor (which carries the click tags) cannot put them in the database.
- Only text has formatting. Links, email addresses and picture descriptions do not; typing the tags there saves them as plain characters.
- Headings and body text are set in Figtree, whose real italic is loaded (weights 400 to 600). Comfortaa, used only for the wordmark and the Community Voices preview cards, has no italic of its own, so the browser slants it there.

## Environment variables

| Name | Where | What it does |
|---|---|---|
| `ADMIN_EMAILS` | Vercel (set) and `.env.local` | Comma separated. Only these addresses are sent a sign-in code. Currently the founder (two addresses), John and Maddie. |
| `ADMIN_HOST` | Vercel (set: `editor.communityhb.tech` on the editor project) and `.env.local` | Host the editor lives on, for example `editor.communityhb.tech`. Locally `admin.localhost:8123`. Unset in production means the editor is off. |
| `POSTMARK_SERVER_TOKEN`, `POSTMARK_FROM` | Vercel, both projects (not set yet: needs a token from Gaurav) | Sends the sign-in codes and the contact form through Postmark, the service the organisation already sends `mail@communityhub.cloud` with. Preferred: that mail reaches Oberlin inboxes. Sender defaults to `Community Hub <mail@communityhub.cloud>`. |
| `RESEND_API_KEY`, `MAIL_FROM` | Vercel (set on both projects) | The fallback when there is no Postmark token. Since 2026-11-21 `MAIL_FROM` is `Community Hub <website@uhurued.com>` on both projects, the owner's stop-gap ("use uhurued for now"): uhurued.com is another of his domains, older and verified in his Resend account. Before that it was `website@communityhb.tech`, registered in October 2026, and **Oberlin's mail system removed mail from that domain after accepting it** (Resend showed two sign-in codes "delivered" to an oberlin.edu address; the mailbox held nothing, not in spam or trash). The lasting fix is still Postmark, so the mail comes from communityhub.cloud. |
| `BETTER_AUTH_SECRET` | Vercel (set, hidden) and `.env.local` | 32+ characters; signs sessions. |
| `DATABASE_URL` | Vercel (set) | Hosted Postgres (Neon). Unset locally: an in-memory pglite database is used. |
| `BLOB_READ_WRITE_TOKEN` | Vercel (Production, set by the Blob store) | Picture uploads. Unset locally: pictures go to `.cms-media/` (or `CMS_MEDIA_DIR`). |

## Cloud setup status (checked 2026-11-21, updated 2026-11-23)

Two Vercel projects in team Community Hub run the same code against the same database:

- **`communityhub-cloud`: the public site** (www.communityhub.cloud). Connected to GitHub (`Community-Hub/communityhub.cloud`, branch `master`), so every merge deploys it. It has no `ADMIN_HOST`, so it serves no editor: `/admin` and `/api/cms*` answer 404 there.
- **`community-hub-site`: the editor** (https://editor.communityhb.tech, `ADMIN_HOST=editor.communityhb.tech`). The domain `communityhb.tech` is registered with Vercel, so no outside DNS record is needed. Since 2026-11-21 it is connected to the same GitHub repository and branch as the public site, so every merge to `master` deploys both and the editor always lists the words of the build that is live. (Before that it was deployed by hand and had fallen behind, still on the 2026-11-12 build.)
- Both read the same Neon database (`DATABASE_URL` is identical) and sign sessions with the same `BETTER_AUTH_SECRET`, so an edit saved in the editor is what the public site reads. `ADMIN_EMAILS` (four addresses), `RESEND_API_KEY` and `MAIL_FROM` are set on the editor project. `ADMIN_SIGNUP_CODE`, left over from the password days, was deleted from it on 2026-11-23; nothing read it. Each project has its own Blob store token; pictures uploaded in the editor are public Blob addresses, which the public site accepts.
- **The editor must run the same build as the site.** It lists the words of the build it was deployed from; on an older build it shows old defaults, and an edit made against them is set aside as "Out of date" on the public site. The shared GitHub connection keeps them together: if a merge deploys one project and not the other (a failed build), redeploy the one that is behind.
- Pull requests build a preview on both projects. The editor project's preview builds run the migrations against the shared database, so a pull request that adds a migration applies it there before it is merged.
- The cache purge on save runs in the editor's project. A real edit was seen on the public site on 2026-11-23, but the delay was not timed, so it is still unknown whether the purge reaches the public project's cache or the 1-minute refresh does the work. Either way, edits show on the public site after about a minute (the first visit after that minute still gets the old page and starts the refresh; the next one gets the new wording).

## Giving someone access

1. Check their address is in `ADMIN_EMAILS` on the editor project (`community-hub-site`); redeploy if you change it.
2. Send them https://editor.communityhb.tech. There is nothing else to send: no password, no code from you.
3. They type their email address, receive a 6-digit code by email, and type it in. The first time also creates their account. They stay signed in on that browser for a week. They land on the site itself, ready to click wording and change it.

Result: `editor.communityhb.tech` serves only the editor (`/` goes to `/admin`). Cookies belong to the editor host only (host-only, httpOnly, SameSite strict, Secure).

## Adding Maddie and John

They are already on `ADMIN_EMAILS` (as `john.petersen@oberlin.edu` and `mfaubert@oberlin.edu`; the address must match exactly). To add or remove anyone: edit `ADMIN_EMAILS` in Vercel and redeploy (sessions are checked against the list on every request, so removal takes effect immediately after the redeploy). Each person then opens the editor address and signs in with a code sent to their email.

## Security notes

There are no passwords (the owner's choice, 2026-11-21): a listed address is emailed a 6-digit code, and reading that mailbox is the proof. The code works for 10 minutes and for 5 tries, is stored hashed, and is never logged when live; a new code cancels the old one. A signed-in browser stays signed in for 7 days, not extended by use, then needs a new code. Only listed emails are sent a code; anyone else is told the address cannot use the editor. Asking for a code and using one are each limited to 5 a minute per IP address (taken from `x-forwarded-for`, which is only trustworthy on Vercel, so the app must stay hosted on Vercel); everything else the sign-in library offers (passwords, password reset, changing an address) answers 404; cookies are secure and host-only; writes need a matching Origin (CSRF); everything is stored as plain text and escaped when drawn, with `<b>` and `<i>` the only two tags that mean anything (they become `<strong>` and `<em>` elements made by the page code, never markup written into the page); links must be `/path`, `#`, `https://`, `http://`, `mailto:` or `tel:`; image URLs must be the original, a stored upload or this project's Blob store; the editor host sends `no-store`, `X-Frame-Options: DENY`, `X-Content-Type-Options: nosniff`, a Content Security Policy with `frame-ancestors 'none'`, and `noindex` (the public site is unchanged); the path is lower-cased and decoded before the host check, so `/Admin` and `/%61dmin` are 404 on the public host; uploads are cut off at 4 MB while streaming; outside `NODE_ENV` development or test the editor refuses to run without `ADMIN_HOST` and a 32+ character `BETTER_AUTH_SECRET`.

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

## What cannot be edited

Checked on all 31 public pages (2026-11-21): of 1,799 pieces of wording a person can read, all but a handful can be clicked and changed on the page.

- **The lesson grade lines on the Teacher toolkit** ("Grades 8 to 12"): the page works them out from each lesson's grade tags, which also drive the grade filter. The lesson's type and subjects next to them can be edited.
- **On the Privacy Policy:** the sentence Google's review requires word for word (`legal.limitedUse`) and two web addresses shown as code.
- **Text inside live examples** (dashboards, calendars, slide stories, Community Voices players): they are other sites shown in frames. The Community Voices preview cards drawn by this site are editable.
- **Words only a screen reader hears** (picture descriptions, button names for assistive technology) are not clickable on the page; picture descriptions are edited with the picture in the list at `/admin`.
- Chapter and school names (`CHAPTERS`, `SCHOOLS_NAME`), embed and frame addresses, and the `{count}` placeholder in the toolkit intro are fixed in the code.
- Hiding: only the sections listed under "Show or hide" can be hidden.
- Items you add to a list cannot have their words edited afterwards (remove and add again).
- The Blob check accepts any Vercel Blob address, not only this store.

## Where a page's own wording lives

Most wording is in the shared content files (`src/lib/copy.ts`, `page-content.ts`, `content.ts` and the data files). Wording that used to be written directly inside a page or component file now lives in `src/lib/page-text/<name>.ts`, one file per source file, moved there by a script on 2026-11-21 (495 pieces across 28 files). Each of those files registers its wording with the editor (`registerText`), under keys that start `text.<name>.`.

- These files travel with their own page's code, so the public site downloads a page's wording only with that page. The same goes for the 2016 implementation guide (`src/lib/bring-guide.ts`) and the Community Voices preview slides.
- The server loads all of them up front (`src/lib/page-text/all.ts`, imported by the content service), because the editor must list and check every entry. **A new page-text file must be added to `all.ts`.**
- In a page or component, read wording when drawing (`txt.heading1`), never copy it into a constant: an edit would not show. For a constant list at the top of a file, use a getter (`get title() { return txt.title2; }`), as the script did.
- New wording goes into the page's `page-text` file by hand, then is used as `txt.<key>`.

