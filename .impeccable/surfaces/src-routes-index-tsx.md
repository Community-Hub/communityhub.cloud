---
version: 1
slug: "src-routes-index-tsx"
primary_target: "src/routes/index.tsx"
related_targets: []
---

# Surface brief: communityhub.cloud home page (redesign)

Scope: the home page (src/routes/index.tsx and the components it uses); the shared header, footer and page templates carry the same system to every route. Visitor mode: Persuade.

Audience and job: city and town staff, neighborhood organizations, campus sustainability offices, K-12 districts and museums deciding whether Community Hub fits their place; residents meeting the screens are secondary.

Action: Contact us (owner's choice), a real form at /contact that emails through Resend, with connect@communityhub.cloud as the fallback.

Proof and content: the real hero film, the three product categories with their live examples, eight named testimonials, the research and results, the five implementations, the pricing bundles. Every word comes from the CMS-registered content objects; nothing invented.

Constraints: keep every page, asset, embed, demo, CMS key, redirect and the sitemap. Rebuild the live-only contact form, implementations pages and implementation guide.

## Direction contract

THESIS: The category standard at Apple's level of polish, played straight: the current site's own film, categories and proof, organized into a calm brochure the visitor turns one page at a time, ending in Contact us. Each section is one full screen that snaps into place (owner, 2026-11-16: "make it be like a book you swipe one by one, open like a brochure"), a real document underneath rather than the old storyboard's captured wheel and chapter chrome. It refuses the cluttered tab-in-tab chrome of the old pages.

OWN-WORLD: white page with Community Hub ink #152019 and pine #123a29 type, Community Hub lime #c9db87 for the primary pill and a pale lime band for quotes, leaf #467d58 for links and focus; Figtree for headings and text, Comfortaa only in the wordmark beside the hands-holding-a-town mark; large rounded photo panels (1.25 to 1.75rem), hairline dividers, generous spacing; real installation photography and the real film.

STORY: The visitor sees the town and the line "act locally while thinking globally"; when the film ends the page turns to Who it's for (owner: "after the video is done, it should auto scroll to the next page. But that is who it's for"), where each audience shows its real place (Where it runs is folded in here); the platform page assembles the product family's icons (owner: "this is supposed to be an animation!"); the visitor walks the three categories, each product in one plain line with its live example (owner: "not just verbose"); meets the people and results that prove it; sees how it is priced; and contacts Community Hub or books a demo.

FIRST VIEWPORT: Fixed header (mark and wordmark left; Products, Implementations, Pricing, Research, Story, About; lime "Contact us" pill right). The film is the cover: a full-screen rounded panel with the headline set left on the film, the one-line description, a lime "Contact us" and a secondary "Book a demo" (owner: "book an appointment, book a demo, it should send it to dashboard@oberlin.edu"), and a pause button on the film. Page dots on the right edge on wide screens.

FORM: canon (the standing exit), chosen by the owner on the options page with Apple as the polish bar; seed:ee5e433cccf037d0 was rolled and declined in favour of canon. Comp round: the owner approved comp 1 (.impeccable/mocks/decision/canon.png), then downgraded it to a guide in words ("Yes, a guide only"; "it should be more like what is on the current page, like the video and the categories on there and everything. But it should be more slicker and more organized in form."), so the build is code-led against the real content and canon.png is the finish review's critique reference. Signature interaction: the film plays once and rests with a visible pause/play control; categories switch products with an underline tab bar and the live example follows.

Later owner decisions (2026-11-16), binding on later passes: photos that do not fill their frame sit on the page background with no box of their own ("the background should not be obviously separated"); arrows sit on both sides of the content and Pause below it ("The arrows for next should sandwich the entire content, and the post should be below it"); every page fits a phone ("make sure it is responsive on phone"); form messages and demo bookings go to dashboard@oberlin.edu.

FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, DESIGN.md, and every shipping raster carrying its provenance
