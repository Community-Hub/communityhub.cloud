# Local review — 4 October 2026

Imported source: 90f637ed080f0ba5e0cabb9382716c078c52b248.
Runtime image: ch-communityhub:5993, local image ID sha256:bfe0034d3851819d577a096354e93ea3f009b0f435f1b4d9d78b4ba69418a7fe.

Container build: Astro check and production build passed; 38 pages generated.
HTTP: /, /about.html and /digital-signage.html return 200. Missing page and
missing asset return 404 with the custom HTML error page and no-store header.
/healthz returns 200 text/plain. HTML uses no-cache.

Independent visitor review: desktop 1265×712 and mobile 390×844.
Tested home, index.html, products.html, digital-signage.html, contact.html,
dashboards.html#great-lakes-science-center and the City of Oberlin dashboard tab.
Hero video, photographs and navigation load. Mobile menu opens/closes, Explore
advances to testimonials and Next changes the story from 1/8 to 2/8.
No accidental overlap or local asset failure observed. Contact prepares email;
no email was sent. External GLSC dashboard loaded after its loading state.

Follow-up: narrow embedded dashboard sidebar consumes most visible width.
The supplied Open dashboard action remains available. This is inherited source
or external embed behavior, not an established hosting regression.

This bounded review is not a full browser-suite pass, Preview Proof or Prod
verification. Local npm validation and the complete inventory remain pending.
