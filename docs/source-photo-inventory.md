# Source photo inventory for the replacement composition

Inspected 2026-10-01. Read-only asset inspection; no website edits, downloads, crops, generated images, or asset replacements. Pillow read metadata only; `view_image` supplied visual inspection; ffprobe read video metadata.

Site root: `/Users/kwaku/Docs/3:2 Engineering/CH Website Prototype/site_ts`.

Except where an absolute path is given, file names below resolve under `public/assets/` in that root. Ratios are width ÷ height. Sizes are decimal kB, rounded. Dimensions describe the actual files, not an assumed camera original. “Complete” means preserving every pixel in that available file, even where the source file itself was already cropped.

## Composition implications

- The original carousel spans ratios **1.257–2.326**. Give each photo its natural aspect ratio within a composed stage. A universal `object-fit: cover` rectangle would remove people, displays, or useful place context. Avoid replacing that with a conspicuous fixed black picture frame around every image.
- Stories 01, 02, 04, 06, and 07 provide 2199–2560 px of horizontal detail. Stories 05 and 08 are only 1000 and 800 px wide. Their layouts need to accommodate smaller photographs rather than magnify them into backgrounds. At 2× pixel density, an 800 px source supplies 400 CSS px without interpolation; this is a sampling limit, not a demand to make every image tiny.
- The official **Hotel at Oberlin photo has an existing 2560×1427 raw original**, larger than its 1600×892 public derivative. It is a strong full-frame installed-signage image. The Contact workshop source is already available publicly at 2560×1929 and provides another strong people-and-product scene.
- The Education chapter currently introduces Building Dashboard while opening a **whole-city electricity** heat map. This is an actual source/story mismatch, separate from layout quality. The available Building Dashboard screenshot is only 544×302; the current `mini-oc-embed.jpg` fallback depicts an introduction page, not a building chart.
- The mobile video variant is **720×406**, not 1280×720. Filling a tall phone screen with it both enlarges and severely crops the footage. Preserve its storytelling role without assuming cinematic fullscreen resolution.
- Human photographs should retain their original testimonial associations. A picture paired with a named quote is not proof that the pictured person is the named speaker. Several official pairings are illustrative community scenes.

## Eight original homepage stories

Provenance: `tests/fixtures/live-home-source.json`, independently captured from `https://www.communityhub.cloud/` at `2026-10-01T05:15:12Z`. All eight local SHA-256 hashes match that fixture. All eight images were opened and visually inspected. Source links below are the fixture's exact URLs.

| File / original quote association | Native dimensions; ratio; format; size | Seen content and fit |
| --- | --- | --- |
| `live-home-story-01.jpeg` — Grace Gao | 2560×1707; 1.500; JPEG; 411 kB | Child leaning toward light-bulb demonstration, with other participants behind. Strong close human focus; keep bulb at lower left and face at right. Original scene is shallow-focus, not a portrait of Grace confirmed by this audit. [Source](https://www.communityhub.cloud/wp-content/uploads/2021/10/2062-scaled.jpeg) |
| `live-home-story-02.jpeg` — Kim Koos | 2352×1483; 1.586; JPEG; 2178 kB | Children and adult looking at a wall-mounted Citywide Dashboard. Keep the full group and complete screen. Clear education/signage context; the screen is visibly Citywide even though the source primary CTA says Phone App. Preserve source association. [Source](https://www.communityhub.cloud/wp-content/uploads/2021/10/children_screen.jpeg) |
| `live-home-story-03.png` — Scott Volmer | 1077×857; 1.257; PNG; 1697 kB | Group at GLSC, wall dashboard at left, touch controller below, gesturing participant at right. Near-portrait landscape shape; a wide crop removes the system and participants. Good medium-size full photograph. [Source](https://www.communityhub.cloud/wp-content/uploads/2021/10/glscscreenedit-01.png) |
| `live-home-story-04.jpeg` — Bob Mendenhall | 2560×1707; 1.500; JPEG; 525 kB | Student using a laptop with Citywide Dashboard visible; second laptop and school materials behind. Strong education scene. Keep face, hand, and laptop together. Source quote/CTA associates this with Building Dashboard; do not invent a different attribution. [Source](https://www.communityhub.cloud/wp-content/uploads/2021/10/Studentengagement-scaled.jpeg) |
| `live-home-story-05.jpeg` — Janet Haar, Citywide quote | 1000×430; 2.326; JPEG; 70 kB | Portrait outside Oberlin Business Partnership with sidewalk/cinema context. The file is already a shallow panorama. Do not force it into a tall photo column or zoom to fill a 3:2 box. [Source](https://www.communityhub.cloud/wp-content/uploads/2021/10/Haar-e1638938380201.jpeg) |
| `live-home-story-06.jpeg` — Linda Arbogast | 2199×1523; 1.444; JPEG; 683 kB | Library workshop with seated participants and projected resource dashboard. Full image explains communal use; a tight central crop removes the audience. Wider framing is useful even though its upper ceiling is quieter. [Source](https://www.communityhub.cloud/wp-content/uploads/2021/10/953.jpeg) |
| `live-home-story-07.jpeg` — Janet Haar, Calendar quote | 2560×1702; 1.504; JPEG; 672 kB | Indoor market, visitors, produce tables and stalls. Strong calendar/community-life scene with warm color; keep table foreground and people. [Source](https://www.communityhub.cloud/wp-content/uploads/2021/10/1417-scaled.jpeg) |
| `live-home-story-08.jpeg` — Geoff Hunter | 800×533; 1.501; JPEG; 88 kB | Person speaking to a crowd at W. College St / N. Main St. Speaker is above center; foreground crowd intentionally soft. Small source: suitable for modest image area, not full desktop bleed. [Source](https://www.communityhub.cloud/wp-content/uploads/2021/10/5100.jpeg) |

Existing public derivatives repeat these scenes: `kid-lightbulb.jpg` (01), `kids-citywide-screen.jpg` (02), `glsc-exhibit.jpg` (03), `student-data-hub.jpg` (04), `classroom-dashboard.jpg` (06), `farmers-market.jpg` (07), and `street-event.jpg` (08). Those scene matches were visually verified; their files are not claimed byte-identical. Prefer the independently sourced originals for these story associations.

## Engage installed-signage photographs

The locations in the first column are existing authored captions in `src/content/home.ts:262`. They were not independently established from geolocation. Visual observations are separate. No acquisition manifest was found for the two `eng-sign-*` images or the cafe image in this bounded audit; do not invent photographer/date credits.

| Existing file / caption context | Native dimensions; ratio; format; size | Seen content / recommendation |
| --- | --- | --- |
| `eng-sign-daves.jpg` — Dave's Market, MidTown | 917×611; 1.501; JPEG; 129 kB | Installed screen with Community Voices message and phone-control/QR poster below. Native image already cuts the lower poster. Moderate resolution and photographed text; use as concrete installation evidence at modest size. The source photo does not show checkout counters in-frame. |
| `hotel-oberlin-sign.jpg` — Hotel at Oberlin | 1600×892; 1.794; JPEG; 152 kB | Clear sign mounted in wood wall, with the real lobby and second sign visible. Strong wide scene. Matching official product source exists locally at higher resolution; see below. |
| `kids-citywide-screen.jpg` — Oberlin school hallway | 1600×1009; 1.586; JPEG; 212 kB | Same children/screen scene as original story 02. The 2352×1483 source original is already available. |
| `glsc-workshop.jpg` — GLSC workshop | 1600×1206; 1.327; JPEG; 245 kB | Posed group at wall display and touch tablet. Avoid cropping the people kneeling at the bottom or faces at the sides. Same scene as the larger official Contact image, below. |
| `glsc-exhibit.jpg` — GLSC exhibit | 1077×857; 1.257; JPEG; 161 kB | Same scene as original story 03. Prefer the exact original PNG for its established source pairing. |
| `eng-sign-oc-exhibit.jpg` — Carbon Neutral Stories, Oberlin College | 1505×875; 1.720; JPEG; 242 kB | Three people before a large physical exhibit with screens, devices and explanatory material. A dark interface strip and green control are already visible at the right edge: this is not a clean camera-photo export. Useful evidence, weaker choice for a pristine full-frame lead image. |
| `cafe-window-sign.jpg` — Slow Train Cafe | 827×220; 3.759; JPEG; 42 kB | Extremely shallow panorama of cafe frontage, bikes, screen and branding. Keep as a small wide inset; a tall or large treatment magnifies softness or removes context. |

Higher-resolution existing alternatives, both visually inspected:

- `/Users/kwaku/Docs/3:2 Engineering/CH Website Prototype/assets/raw/communityhub/screenshots/Hotel-Signage-scaled-e1639418142498.jpeg`: **2560×1427, ratio 1.794, JPEG, 1354 kB**. Same complete lobby/signage scene as the public derivative. Exact official source URL is recorded in `src/content/live-products.json`: [Hotel Signage source](https://www.communityhub.cloud/wp-content/uploads/2021/12/Hotel-Signage-scaled-e1639418142498.jpeg). The larger raw original has not been copied or altered during this audit.
- `live-contact-workshop.jpg`: **2560×1929, ratio 1.327, JPEG, 4155 kB**. Exact hash/source in `tests/fixtures/live-organization-source.json`: [GLSC workshop source](https://www.communityhub.cloud/wp-content/uploads/2021/12/191013_GLSC_ED_Wrkshp-033-scaled.jpg). It is byte-identical to the repository raw file and shows the same group as `glsc-workshop.jpg`.

## Dashboard imagery and the Educate mismatch

| File | Native dimensions; ratio; format; size | Actual visual content / provenance boundary |
| --- | --- | --- |
| `building-dashboard.png` | 544×302; 1.801; PNG; 100 kB | Building photo, energy totals, natural-gas area chart, heat map and comparison bars. It communicates the correct product, but tiny labels are already soft. The matching raw source is also only 544×302, not a hidden higher-resolution original. Official source media is [Buildingdash](https://www.communityhub.cloud/wp-content/uploads/2021/12/Buildingdash-e1639411178404.png), recorded in `live-products.json`. Local derivative differs in bytes. |
| `data-hub.png` | 1339×743; 1.802; PNG; 222 kB | Data Hub authoring interface: variables, customization controls, time-series plot. Correct for Data Hub management, not an illustration of a finished building display. Official media URL recorded in `live-products.json`: [Data Hub demo](https://www.communityhub.cloud/wp-content/uploads/2021/12/datahubdemo-e1639411289795.png). |
| `mini-oc-embed.jpg` | 1280×800; 1.600; JPEG; 129 kB | Oberlin College dashboard **home/introduction page**, with sidebar and Explore cards. Despite its use as the Building tab fallback, it contains no live building chart. |
| `mini-cwd.jpg` | 1280×900; 1.422; JPEG; 163 kB | Oberlin illustrated town and whole-city/college/schools electricity gauges. Native screenshot includes black top/bottom bands. Correct Citywide product; avoid adding a second decorative frame. |
| `cwd-poster.jpg` | 1637×1161; 1.410; JPEG; 340 kB | Illustrated Oberlin town/resource flows and squirrel; no right-side live gauges. An illustration/poster, not a whole live dashboard screenshot or photograph. |
| `dash-cleveland-cwd.jpg` | 1600×900; 1.778; JPEG; 215 kB | Cleveland illustrated city and air-quality gauges. Correct Citywide dashboard; don't label it Oberlin or Building Dashboard. |

Code cause: `home.ts` sets its Building Dashboard media to `H.data_views()`. In `src/lib/content-helpers.ts:272`, the helper selects entry 0. `src/content/catalog.ts` entry 0 is heat-map 969, explicitly **“Whole city electricity, last 60 days”**; entry 1 is likewise whole-city electricity. Entry 2 is the public OC building dashboard URL with `active-data-dashboard=805`. These are data scopes, not interchangeable visual skins. This inventory did not modify the helper, select a new default, or claim a new live-feed verification.

## Hero/video material

All stills below were visually inspected. Existing narrative documentation names the original video URL as `https://www.communityhub.cloud/wp-content/uploads/2021/12/benf-zoomin-ch.mp4`; that is prior repository provenance, not a fresh network hash match. The footage stages are globe → aerial downtown → people waving outside Ben Franklin. The globe is rendered/satellite-style material, not a photograph of the local community.

| File | Native metadata | Seen content / risk |
| --- | --- | --- |
| `hero-ch-poster.jpg` | 1600×900; 1.778; JPEG; 57 kB | Full globe against space; visible softness in land texture. |
| `hero-zoom-poster.jpg` | 1280×720; 1.778; JPEG; 52 kB | Larger globe already partly outside the source frame. |
| `hero-still-1.jpg` | 1280×720; 1.778; JPEG; 40 kB | Full globe/space. |
| `hero-still-2.jpg` | 1280×720; 1.778; JPEG; 94 kB | Aerial view of park and storefronts; limited detail at desktop enlargement. |
| `hero-still-3.jpg` | 1280×720; 1.778; JPEG; 91 kB | Four people waving outside Ben Franklin. Store lettering already cut along top; avoid further arbitrary cover crop. |
| `oberlin-aerial.jpg` | 1920×1080; 1.778; JPEG; 293 kB | Autumn downtown aerial, useful real place context. Existing raw counterpart: `../assets/raw/environmentaldashboard/photos/aerial-shot-1080p.jpg`, same dimensions, 1987 kB; derivative bytes differ. |
| `hero-ch-fwd.mp4` | H.264; 1440×810; 30 fps; 17.9 s; 7557 kB | Current desktop source. Metadata checked; no new video encoding or motion review in this audit. |
| `hero-ch-fwd-720.mp4` | H.264; **720×406**; 30 fps; 17.9 s; 2894 kB | Current mobile source. Very limited vertical pixels for tall-screen filling. |
| `hero-ch.mp4` / `hero-ch-720.mp4` | H.264; 1440×810 / 720×406; 35.8 s; 10382 / 4650 kB | Older longer pair; file names alone do not establish intended playback behavior. |
| `hero-zoom.mp4` / `hero-zoom-720.mp4` | H.264; 1600×900 / 720×406; 29.1 s; 11575 / 4394 kB | Alternative older pair. Preserve the accepted forward-only behavior rather than swapping by apparent resolution alone. |

## Other existing human/place photographs

The following were visually opened. They are existing local files, not proposed replacements for the eight source pairings. The folder names suggest events/years, but this bounded audit found no URL/credit manifest for `photos/`; those names do not establish provenance, date, identities, or permission independently.

| File | Native dimensions; ratio; format; size | Observed content / possible story fit |
| --- | --- | --- |
| `town-gown-kids.jpg` | 1400×993; 1.410; JPEG; 236 kB | Adults/young adults and children at a colored activity wheel and Ecolympics table. Useful educational participation; no named identities inferred. |
| `downtown-shop.jpg` | 1600×1067; 1.500; JPEG; 243 kB | Two people smiling together inside a shop. Warm everyday community context, no dashboard in frame. |
| `photos/ofm-2025/ofm-2025-16.jpg` | 1600×757; 2.114; JPEG; 391 kB | Outdoor market stalls and visitors. Complete wide scene, useful for calendar/place context; not a portrait crop. |
| `photos/oc-students-2025/oc-students-2025-06.jpg` | 1600×1200; 1.333; JPEG; 523 kB | People talking around tables in a leafy courtyard. More place/setting than close facial interaction. |
| `photos/big-parade-2023/big-parade-2023-01.jpg` | 1600×1067; 1.500; JPEG; 308 kB | Parade participants, handmade float, street and observers. Some motion/optical softness already present. |
| `photos/big-parade-2023/big-parade-2023-09.jpg` | 1600×2400; 0.667; JPEG; 350 kB | Tall image with “Wild for Pollinators!” sign and participants. Strong authentic portrait orientation; keep sign and person rather than force landscape. |
| `photos/juneteenth-2022/juneteenth-2022-37.jpg` | 1600×1067; 1.500; JPEG; 369 kB | People at a heritage-information table under outdoor tents. Useful community organization/event context. |
| `photos/green-team-2026/green-team-2026-01.jpg` | 1600×2133; 0.750; JPEG; 418 kB | Meeting participants engaging with transportation display boards; foreground is backs of heads. Documentary evidence, less direct human focal point. |
| `photos/midtown-2026/midtown-2026-03.jpg` | 1600×2133; 0.750; JPEG; 355 kB | Smiling person with yellow flowers at an indoor event. Strong portrait, but identity/context are not established by this audit; do not attach an unrelated named quote. |

The mission photo/connection diagram search is intentionally excluded because a separate agent owns that source recovery. This inventory provides asset constraints, not approval of the previous visual design.
