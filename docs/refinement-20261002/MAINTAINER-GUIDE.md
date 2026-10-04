# Community Hub maintainer guide

This guide describes the October 2 refined Astro/TypeScript project. Start with `QA-STATUS.md` in the delivered source for the exact tested candidate and limitations. Older dated verification files describe their own historical versions.

## 1. Install, develop and build

Requirements: Node 22.12 or newer and npm. The checked environment used Node 24.19 and npm 11.9. The lockfile is part of the handoff; use `npm ci`, rather than silently upgrading dependencies.

```sh
npm ci
npm run dev
```

Development binds to `127.0.0.1`; Astro prints the URL, normally port 4321. To reproduce the static production build:

```sh
npm run check
npm run build
npm run preview -- --port 4327
```

Open `http://127.0.0.1:4327/`. Preview serves `dist/`; it does not rebuild edited source. Do not use `file://`, because modules, route behavior and third-party embeds require a web server. The site has no local application backend or secret configuration requirement. Live content still needs internet access.

## 2. Architecture and where to edit

| Path | Responsibility |
| --- | --- |
| `src/pages/index.astro`, `src/pages/[slug].astro` | Static route entry points and redirects |
| `src/layouts/PageLayout.astro` | Shared document, metadata, local fonts, header/footer and browser entry point |
| `src/components/Header.astro`, `Footer.astro` | Main navigation and shared page furniture |
| `src/content/site.ts` | Registers exactly 35 content pages; fails a build if the count drifts |
| `src/content/catalog.ts` | Shared products, audiences, examples, quotations and public destinations |
| `src/content/home.ts` | Homepage narrative and selected product presentations |
| `src/content/people.ts` | Audience pages, organization and community examples |
| `src/content/products*.ts` | Product and live-dashboard page content |
| `src/content/resources.ts`, `directories.ts` | Resource content and overview directories |
| `src/content/meeting-embeds.ts` | Verified native application contexts and phone walkthrough markup |
| `src/content/hub-flow.ts` | Source-led Dashboard Platform explanation on Data Hub |
| `src/content/original-story.ts` | Products `#how`: complete original Story of Dashboard slides, using the shared manual controller |
| `src/content/lesson-links.json` | Verified individual lesson PDFs |
| `src/lib/site.ts`, `content-helpers.ts`, `types.ts` | Typed page construction, images, shared live frames and common markup |
| `src/scripts/index.ts` | Ordered initialization of browser modules |
| `src/styles/index.css` | Ordered stylesheet entry point |
| `public/` | Local source media and fonts, copied verbatim by Astro |
| `scripts/verify-build.mjs` | Final HTML/CSS copy-policy guard invoked by the Astro build |

This is a static Astro site with typed content renderers and progressive browser enhancements. It is not a client-side SPA. Existing `.html` links and fragment identifiers remain deliberate contracts. The contact form prepares an email through the visitor's mail client; it is not a server-side email delivery service.

### Routes

The build emits 35 content pages:

- Home and organization: `index`, `about`, `contact`, `pricing`, `404`
- Products and demos: `products`, `the-hub`, `data-dashboard`, `stories`, `community-calendar`, `community-voices`, `digital-signage`, `phone-app`, `web-embeddables`, `dashboards`, `see-it-live`
- Audiences: `who-its-for`, `campuses`, `cities`, `neighborhoods`, `museums`, `schools`
- Examples: `examples`, `oberlin-college`, `city-of-oberlin`, `midtown-cleveland`, `great-lakes-science-center`, `hamilton-college`
- Resources: `resources`, `education`, `research`, `media`, `bring-a-dashboard`, `environmental-dashboard`, `story-of-dashboard`

Each produces a corresponding `.html` file. Three compatibility redirects, declared in `src/lib/site.ts`, bring the total to 38 HTML outputs:

| Old path | Destination |
| --- | --- |
| `data-hub.html` | `the-hub.html` |
| `building-dashboard.html` | `data-dashboard.html#building` |
| `citywide-dashboard.html` | `data-dashboard.html#citywide` |

The source archive's older 32-page claim was not the actual supplied route inventory. Do not remove these additional directories to force that historical count.

## 3. Content and media updates

1. Find the typed page or shared catalog entry that owns the content. Edit source, never generated `dist/` HTML.
2. Preserve verified original wording and quotations. The authoritative wording source is the original CommunityHub website; explicit approved October revisions are recorded in `tests/fixtures/approved-refinements.json`. Do not casually refresh titles, affiliations, statistics or claims from inference.
3. Keep section IDs and public product destinations stable. If a URL changes, verify its actual destination and native controls, then update all related content/configuration and tests together.
4. Put additional authorized media under a descriptive, separately named path in `public/`. Retain the original supplied bytes. Never silently overwrite an existing source photo with a different crop or subject.
5. Measure image dimensions from the actual bytes and update `src/content/image-sizes.json` where appropriate. Filename suffixes are not evidence of width. Check both `srcset` descriptors and final rendered aspect ratios.
6. Match every image to its adjacent claim. A person at a touchscreen is not evidence of phone control. Recorded chart screenshots must not be labeled as current readings. Keep quotations attached to the correct context.
7. Use individual presentation illustrations and evidence elements on marketing pages. Keep whole historical slides in the dedicated original-source viewer. The platform animation uses the source slide's own assets and sequence; it is not a flattened slide screenshot.
8. Retest the changed route, its shared component siblings, direct hashes, keyboard controls and a narrow viewport. Record real results, not just a successful build.

### Provenance

All originally supplied public files remain byte-identical. The upload contained optimized media derivatives whose dimensions/hashes differ from older provenance fixtures. Historical fixtures remain historical; `uploaded-optimized-media` fixtures identify the actual supplied files. Do not overwrite historical hashes to make a test green.

Additional material has explicit provenance under `docs/refinement-20261002/`, the platform asset documentation, and `public/assets/phone-workflow/provenance.json`. The person using the phone beside the Water Use display is an unchanged source photograph. Evidence crops preserve chart labels, axes, legends, dates and values; no data or people have been generated or retouched.

Local Comfortaa and Lato assets and licenses are under `public/fonts/community/`. Keep font licenses when moving the site. The large extracted presentation/photo libraries are intentionally not bundled with the runnable project.

Hamilton's private application endpoint and private dashboard imagery must never be added to public navigation, embeds or media. The historical public case-study prose is not authorization to expose a private system.

## 4. Scene navigation contracts

`src/scripts/pages_home6.ts` owns the page frame list and the public `window.chStory` interface. Other modules listen for `ch:storychange`, use the current semantic owner, or request `go(direction)`. Preserve script initialization order in `src/scripts/index.ts`.

- One intentional wheel/touch gesture advances one complete authored scene with an immediate cut. Inertia from that gesture must not skip another scene or begin scrolling a newly revealed native control. `ui/wheel-gesture.ts` uses a260ms quiet interval with no extra post-cut hold; a meaningful opposite stroke cancels the previous direction. These thresholds are implementation heuristics, not physical-contact detection.
- `ui/product-navigation.ts` preserves the full vertical product sequence on narrow screens. Finish a selected product’s reading frames before entering its adjacent product. Example autoplay and horizontal example arrows never change the selected product.
- Resizing preserves the selected product via its semantic panel anchor. The mobile menu captures the current story before changing page overflow and restores it on close. Do not reintroduce selection from stale pixels or make the old reading-part index choose a different product.
- The brief homepage Web example uses the existing Cleveland live event feed. Only Building uses the special scroll-through canvas. Detailed app pages retain their native controls and source recovery.
- A fresh gesture over a genuinely scrollable region remains native. Menus, dialogs, form controls, horizontal gestures, browser zoom and reduced-motion preferences keep their expected ownership.
- `data-story-scene` identifies authored reading groups. The `all`, `desktop` and `short-phone` modes are intentional responsive contracts, not decorative classes.
- Long reading groups can have continuation stops. Do not throw away a final content-bearing tail just because it is shorter than the preferred quarter-screen step: its last links or lines must remain reachable. Bottom padding alone must not create a dead stop.
- `data-scroll-owner` marks a real internal scroll region. It must have a useful visible height and keyboard access; do not trap the visitor in it.
- Offscreen authored scenes use `inert` and visibility ownership. Update both together so a hidden control does not receive focus.
- Reflow from fonts, images, native embeds and resizing must preserve the semantic scene rather than an obsolete scroll pixel.
- Direct section hashes and refreshes must select the correct scene. Back/forward restoration remains distinct from a fresh load. A valid manual navigation releases the earlier startup hash so a late resource cannot pull the visitor backwards.
- Tab/focus and Page Up/Down must not leave the viewport halfway between unrelated sections or skip the end of a resource.

### Accepted opening

The homepage film and people story are one semantic opening, not two sections. The original film plays once. Natural completion holds its final frame briefly, then presents the held film strip above the complete human photo/quote. Explore, Skip/down arrow and the first downward gesture reveal the same state. The next deliberate gesture goes to Who We Are.

The initial poster is the film's true first frame. Switch fallback and playable video atomically; do not blend two different zoom states or flash the final downtown still before the film begins. Keep the photo, full quote, attribution and primary action visible in the combined state.

## 5. Animations and interaction

- The homepage centered identity has a 2.4-second animation and 6.6-second reading hold on its first uninterrupted visit. It may advance once only while that scene owns the viewport. Manual navigation cancels the pending advance; revisits must not cause a delayed jump. Reduced motion keeps manual navigation.
- Products `#how` shows the original 31-frame Story of Dashboard deck with manual arrows and a full-size image action. Its complete authored caption strips must remain visible and uncropped.
- The Data Hub Dashboard explanation has its own source-led reveal sequence and quiet previous/next controls. It does not automatically advance to another website section. The separate platform notes describe its source assets and exact current sequence.
- Testimonial and photo galleries show one complete item at a time. Hover/focus, explicit pause, a hidden tab and offscreen state preserve the unspent display time. Resuming must not rewind the progress; choosing another item deliberately starts that new item.
- Secondary controls reveal on the content container's hover or keyboard focus and remain usable on touch. Do not restore large persistent Previous/Next/Pause bars or visible item counts. Screen-reader status can remain available.
- Avoid ordinary-content entrance fades that conceal forms or directories during arrival. Purposeful film/identity/story animation is separate from ornamental reveal effects.
- Keep helpful explanations adjacent to charts; they must not replace or cover the axes, values or variable being explained.

## 6. Local examples versus live applications

`meeting-embeds.ts` and its browser module mount only the selected public context. The native Stories TV/controller pair shares a generated web session. It demonstrates the actual synchronized application, not a fictional control surface.

The Phone App walkthrough is a local educational example built from unchanged extracted product assets. Selecting a topic changes the local example screen; recorded readings are labeled. It does not send commands to a physical production display.

Native Citywide uses verified upstream controls, not reconstructed gauges. Community Voices uses the actual source display and verified category URLs. In narrow portrait mode a complete photograph, quotation and categories may require the clearly scrollable region. Do not shrink native text until unreadable simply to eliminate all scrolling.

A native application's `load` event is not a health check. Preserve clear loading/retry states and direct recovery links. A slow-load notice must not obscure an upstream page that has already painted. Do not inject guesses for unavailable live readings or present empty HTTP-200 data as successful live content.

The Media player keeps its local title, description and source link when mounted. Its aspect ratio and fallback must survive a missing thumbnail or upstream playback failure. Contact form success must mean the email was prepared, not that it was delivered.

## 7. Tests and release checklist

Fast source/build checks:

```sh
npm run check
npm run build
npm run test:unit
npm run test:fixtures
npm run test:contracts
```

Python QA dependencies are listed in `requirements-dev.txt`. An optional isolated setup is:

```sh
python3 -m venv .venv
. .venv/bin/activate
python -m pip install -r requirements-dev.txt
```

Browser tests require an authorized browser/runtime. `npm test` includes them; it is not identical to the source-only checks above. The supplied browser suite was syntax-checked and its fixtures compiled, but it was not executed in the cloud review environment. Historical visual/migration parity tests require the missing optional `reference/` baseline. See `browser-test-migration.md` for that boundary.

Before a release:

1. Freeze source and finish the commands above. Do not package while a build is writing `dist/`.
2. Test the actual rendered candidate, not an older deployed version. Record its build hash/source identifier.
3. Check fresh load, refresh, direct hash, previous/next, repeated gestures/inertia, resize and history. Carry the accepted combined opening forward.
4. Inspect full meaningful scenes at normal laptop height and narrow width: heading, explanation, visual, controls and recovery action. Verify real content tails remain accessible.
5. Exercise changed native product controls and local failure paths. Distinguish upstream limitations from local defects.
6. Verify copy, photo/context matching, privacy and all local assets. Never commit credentials, authentication configuration, generated dependencies or unrelated downloads.
7. Produce a clean source snapshot with its lockfile, media, current QA report, checksums and merge instructions. Extract the delivered archives into a new folder and verify the exact combined file set.
8. Push/publish only to the destination and access level approved by the owner. A private repository is not a production deployment. The reviewed preview is owner-only; a public launch requires a separate intentional release.

The final handoff report records actual hosted review coverage and unverified areas. Physical touch devices, Safari/Firefox, every external-app state and an exhaustive cold-cache trace of every route are not implied by a source-test pass. YouTube playback remained upstream-buffering in the review browser; local player behavior was reviewed separately.
