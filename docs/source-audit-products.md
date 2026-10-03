# Product and interior source audit

October 1, 2026. **Implementation frozen.** This audit records reconciliation work required after Kwaku clarified that CommunityHub.cloud's writing and content are the base, with only the final settled meeting changes applied. It does not approve the current candidate or authorize further source edits.

The live site redirects to `www.communityhub.cloud`. Official HTML was read directly on this date. The browser also loaded the real GLSC dashboard. Meeting evidence comes from the supplied transcript analyses and original local frames. No source, media or evidence file was changed during this audit.

## Live product writing versus inherited prototype

| Live name and authoritative page | Current prototype source | Reconciliation |
| --- | --- | --- |
| [Data Hub](https://www.communityhub.cloud/products-and-services/data-manager/) | [catalog.ts:18](</Users/kwaku/Docs/3:2 Engineering/CH Website Prototype/site_ts/src/content/catalog.ts:18>); [products-a.ts:89](</Users/kwaku/Docs/3:2 Engineering/CH Website Prototype/site_ts/src/content/products-a.ts:89>) | Live writing describes a package of online visualization tools. The inherited catalog/detail copy recasts it around acquisition, analytics and dashboard building. Restore the original paragraph as the base; review additional material against meeting decisions separately. |
| [Building Dashboard](https://www.communityhub.cloud/products-and-services/dashboard-creator/) and [Citywide Dashboard](https://www.communityhub.cloud/products-and-services/citywide-dashboard/) | [catalog.ts:5](</Users/kwaku/Docs/3:2 Engineering/CH Website Prototype/site_ts/src/content/catalog.ts:5>); [products-a.ts:244](</Users/kwaku/Docs/3:2 Engineering/CH Website Prototype/site_ts/src/content/products-a.ts:244>) | Live presents two separately named products. The inherited prototype combines them under Data Dashboard. Do not assume this taxonomy change was approved merely because it was already in the prototype. |
| [Community Calendar](https://www.communityhub.cloud/products-and-services/community-calendar/) | [catalog.ts:62](</Users/kwaku/Docs/3:2 Engineering/CH Website Prototype/site_ts/src/content/catalog.ts:62>) | The inherited prototype says Calendar and Jobs Board and substitutes a new description. The meeting reference diagram does include Calendar & Jobs Board, but that is not blanket approval to replace the live product's name and paragraph everywhere. |
| [Community Voices](https://www.communityhub.cloud/products-and-services/community-voices/) | [catalog.ts:76](</Users/kwaku/Docs/3:2 Engineering/CH Website Prototype/site_ts/src/content/catalog.ts:76>) | The inherited brief description replaces the original discussion of community diversity, resilience and content management. Use the live wording as the base. |
| [Digital Signage](https://www.communityhub.cloud/products-and-services/digital-signage-software/) | [catalog.ts:29](</Users/kwaku/Docs/3:2 Engineering/CH Website Prototype/site_ts/src/content/catalog.ts:29>) | Live product heading is Digital Signage; navigation uses Digital Signage Software. The inherited description is rewritten. Preserve the source writing unless a final meeting change specifically overrides it. |
| [Phone App](https://www.communityhub.cloud/products-and-services/phone-app/) | [catalog.ts:40](</Users/kwaku/Docs/3:2 Engineering/CH Website Prototype/site_ts/src/content/catalog.ts:40>) | Live describes both direct phone access to content and controlling nearby signage. The inherited catalog reduces this to a screen remote. Naming and future app capabilities remain deferred, rather than grounds for an unapproved rewrite. |
| Web Embeddables, in the [live homepage](https://www.communityhub.cloud/) | [catalog.ts:51](</Users/kwaku/Docs/3:2 Engineering/CH Website Prototype/site_ts/src/content/catalog.ts:51>) | Live homepage contains its own description; its Learn More link currently targets `#`. Preserve the paragraph while giving the agreed useful destination. |
| No Stories product entry found in the live homepage/navigation | [catalog.ts:89](</Users/kwaku/Docs/3:2 Engineering/CH Website Prototype/site_ts/src/content/catalog.ts:89>) | Stories is an inherited prototype addition. Preserve its existing material while reconciling its placement with the final meeting decisions; do not describe it as copied from the live product catalog. |

The live detail pages retain their original product paragraphs and media. The prototype's much longer detail pages are not verbatim migrations of those pages. My October 1 work did **not** rewrite the `PRODUCTS` descriptions, but reused their inherited short descriptions in the new directory. That reuse does not establish live-source fidelity.

A live homepage Building Dashboard link points to `/products-and-services/data-visualizer/`, which returned HTTP 404 during this audit. Preserve the original writing, not this broken destination; the working official product page is `dashboard-creator/`.

## Newly introduced writing to reconcile

[products.ts:5](</Users/kwaku/Docs/3:2 Engineering/CH Website Prototype/site_ts/src/content/products.ts:5>) introduces Collect / Make sense / Share, three new stage headings and three new explanatory sentences. [products.ts:11](</Users/kwaku/Docs/3:2 Engineering/CH Website Prototype/site_ts/src/content/products.ts:11>) introduces From local information to shared understanding. These are newly authored paraphrases, not the original live writing or the exact meeting reference. Replace them using the original diagram below when implementation resumes.

[products.ts:115](</Users/kwaku/Docs/3:2 Engineering/CH Website Prototype/site_ts/src/content/products.ts:115>) adds a product-selection instruction; the directory and explanation links add interface guidance. The existing group descriptions and demo captions were retained from the prototype, not independently established as original live copy.

[people.ts:1717](</Users/kwaku/Docs/3:2 Engineering/CH Website Prototype/site_ts/src/content/people.ts:1717>) adds dashboard loading/fallback guidance and a short gallery introduction. [content-helpers.ts:178](</Users/kwaku/Docs/3:2 Engineering/CH Website Prototype/site_ts/src/lib/content-helpers.ts:178>) and [content-helpers.ts:262](</Users/kwaku/Docs/3:2 Engineering/CH Website Prototype/site_ts/src/lib/content-helpers.ts:262>) add consistent dashboard/partner actions. These are interface changes tied to the requested direct access and loading clarity, rather than replacements for marketing paragraphs.

[people.ts:940](</Users/kwaku/Docs/3:2 Engineering/CH Website Prototype/site_ts/src/content/people.ts:940>) replaces an overbroad claim that all case-study dashboards are public with an explicit Hamilton restriction. The restriction is directly supported by the final meeting decision.

## Original conceptual model: source and relationships

The existing local [deck/h10.jpg](</Users/kwaku/Docs/3:2 Engineering/CH Website Prototype/site_ts/public/assets/deck/h10.jpg>) matches the full diagram visible in [frame 2290](</Users/kwaku/Docs/3:2 Engineering/CH Website Prototype/tasks/2026-10-01-website-delivery/frames/2290.jpg>). [Frame 2390](</Users/kwaku/Docs/3:2 Engineering/CH Website Prototype/tasks/2026-10-01-website-delivery/frames/2390.jpg>) shows that same original model during a partial reveal. These are the desired reference, unlike frame 2360, which shows the criticized prototype.

Preserve the original labels and relationships:

1. **How the Dashboard Platform Works:** is the title.
2. **Data sources:** comprises Building Performance data; Environmental & Municipal Data; Social Data & Storytelling.
3. Source arrows enter **The Hub**, around the original hands/community identity, with **collects data…** and **to create:** describing the relationship.
4. **Data visualization apps:** comprises Building Dashboard; Hub Analytics; Citywide Dashboard; Calendar & Jobs Board; Community Voices.
5. **For engaging people!** groups Web Embeddables, Interactive Signage and Phone App as communication venues.

The generic three-card draft collapses the distinction between visualization applications and communication venues. The next design should be a readable staged facsimile of the original relationships, using concise corresponding captions, rather than a replacement conceptual model. No new graphic asset is required to identify the source: h10.jpg is already present and was not edited.

## Final meeting decisions and outstanding sources

[Second-half analysis:59](</Users/kwaku/Docs/3:2 Engineering/CH Website Prototype/tasks/2026-10-01-website-delivery/analysis-second-half.md:59>) and [analysis:129](</Users/kwaku/Docs/3:2 Engineering/CH Website Prototype/tasks/2026-10-01-website-delivery/analysis-second-half.md:129>) support direct product/interior entrances without repeated splash barriers. Keep useful imagery and deeper content available. The staged explanation direction is supported at [analysis:91](</Users/kwaku/Docs/3:2 Engineering/CH Website Prototype/tasks/2026-10-01-website-delivery/analysis-second-half.md:91>); exact stage count/timing were not fixed.

[Analysis:117](</Users/kwaku/Docs/3:2 Engineering/CH Website Prototype/tasks/2026-10-01-website-delivery/analysis-second-half.md:117>) requires the actual partner-hosted context, opened separately, while [analysis:135](</Users/kwaku/Docs/3:2 Engineering/CH Website Prototype/tasks/2026-10-01-website-delivery/analysis-second-half.md:135>) requires Hamilton to remain nonpublic. Current mappings are in [catalog.ts:555](</Users/kwaku/Docs/3:2 Engineering/CH Website Prototype/site_ts/src/content/catalog.ts:555>):

| Partner | Verified evidence | Remaining boundary |
| --- | --- | --- |
| [City of Oberlin](https://cityofoberlin.com/city-government/departments/sustainability/) | October 1 recheck of raw official HTML and the rendered browser frame tree found the Community Calendar iframe at `https://oberlin.communityhub.cloud/calendar/city-of-oberlin`. | This is not the gallery’s City Data Dashboard at `https://oberlin.communityhub.cloud/dh-public/city-of-oberlin`. Its exact partner host remains unconfirmed. |
| [Great Lakes Science Center](https://greatscience.com/explore/exhibits/environmental-dashboard) | Official page injects `glsc-embedded-dashboard.js` from its Community Hub host. | Partner-hosted context verified. |
| [Oberlin College](https://www.oberlin.edu/arts-and-sciences/departments/environmental-studies/dashboard) | Official page links Explore the Dashboard to the public `oc-embed` application. | A page hosting the actual embed was not confirmed. John follow-up. |
| [Oberlin City Schools](https://www.oberlinschools.net/) | Official homepage source links to the public `ops-embed` application. | A page hosting the actual embed was not confirmed. John follow-up. |

Visit partner website is truthful for all four verified official destinations, but the City, college and school mappings do **not** fully establish the meeting's requirement to show the selected dashboard on its partner website. Only the GLSC mapping is currently verified for its selected dashboard. Do not label the other three verified embedded versions.

City reconciliation, October 1: the earlier [John follow-up](</Users/kwaku/Docs/3:2 Engineering/CH Website Prototype/site_src6/FOLLOW_UP_WITH_JOHN.md:9>) described a Citywide Dashboard embed on the Sustainability page. That description was not reproduced by the current check: the direct iframe and its loaded browser URL are the [Community Calendar](https://oberlin.communityhub.cloud/calendar/city-of-oberlin). The local gallery explicitly selects the different City Data Dashboard in [people.ts:125](</Users/kwaku/Docs/3:2 Engineering/CH Website Prototype/site_ts/src/content/people.ts:125>).

Precise John follow-up: **Which official City of Oberlin webpage embeds or links to the public City Data Dashboard at `https://oberlin.communityhub.cloud/dh-public/city-of-oberlin`? The Sustainability page currently embeds the Community Calendar; please send the exact partner-page URL for the City Data Dashboard.** The older Citywide claim should not be carried forward as a current verified fact.

Phone naming, home-screen preferences and an app wrapper remain separate product follow-ups ([analysis:169](</Users/kwaku/Docs/3:2 Engineering/CH Website Prototype/tasks/2026-10-01-website-delivery/analysis-second-half.md:169>)). John/Maddie's attribution audit is explicitly deferred ([analysis:181](</Users/kwaku/Docs/3:2 Engineering/CH Website Prototype/tasks/2026-10-01-website-delivery/analysis-second-half.md:181>)). No quotation or attribution was changed in my work.

## Mobile media and implementation boundary

[pages_delivery.css:90](</Users/kwaku/Docs/3:2 Engineering/CH Website Prototype/site_ts/src/styles/pages_delivery.css:90>) currently hides `.page-intro-media` below 700px. The files are preserved, but the images disappear from the mobile presentation. Reconsider this before accepting the candidate: relocate useful imagery within the content rather than hiding it as an incidental consequence of removing splash screens.

The compact header mechanism is [content-helpers.ts:228](</Users/kwaku/Docs/3:2 Engineering/CH Website Prototype/site_ts/src/lib/content-helpers.ts:228>), assembled into the first useful section by [site.ts:39](</Users/kwaku/Docs/3:2 Engineering/CH Website Prototype/site_ts/src/lib/site.ts:39>). These are structural changes; they do not by themselves reconcile the inherited writing with CommunityHub.cloud.

Five targeted interior browser tests passed before the last source refinements. A real GLSC embed loaded visibly after the iframe opacity fix. The current paused source still requires the final coordinated build, tests and visual review after copy reconciliation. No production deployment was made. This document is the only file written for the follow-up audit request.
