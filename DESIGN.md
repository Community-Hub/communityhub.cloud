---
name: Community Hub
description: Original community stories, installations and live environmental data, composed as complete scenes.
colors:
  ink: "#2C2C2C"
  gray: "#CCCCCB"
  paper: "#F4F4F2"
  blue: "#21A7DF"
  blue-light: "#B4E3F4"
  brown: "#C2B59C"
  green: "#5BB951"
  green-light: "#A1CD54"
typography:
  opening:
    fontFamily: "Lato, system-ui, sans-serif"
    fontSize: "clamp(48px,4.4vw,64px)"
    fontWeight: 400
    lineHeight: 1.1
  homepage-opening:
    fontFamily: "Lato, system-ui, sans-serif"
    fontSize: "clamp(52px,5.5vw,80px)"
    fontWeight: 400
    lineHeight: 1.08
  body:
    fontFamily: "Lato, system-ui, sans-serif"
    fontSize: "18px"
    fontWeight: 400
    lineHeight: 1.5
  action:
    fontFamily: "Lato, system-ui, sans-serif"
    fontSize: "15px"
    fontWeight: 700
    lineHeight: 1.4
rounded:
  media: "0"
  control: "4px"
  panel: "6px"
spacing:
  rail: "1280px"
  desktop-gutter: "24px"
  phone-gutter: "20px"
  minimum-control: "44px"
---

# Community Hub design system

Source snapshot: 1 October 2026. This documents the current implementation direction; the final build and independently verified scope are recorded in `docs/VERIFICATION-2026-10-01.md`. It is not release approval.

## Content and source authority

CommunityHub.cloud supplies the base writing, original photographs, testimonials and attribution. The reconciled content brief and final meeting/email decisions govern factual changes. Restore exact original author paragraphs from the old site and native Notion/Box documents. Do not treat later AI summaries or brainstorming as original author copy. Missing original prose does not authorize a replacement marketing pitch; retain useful controls and source evidence, and record remaining factual-summary gaps. Kwaku's latest instructions govern the visual direction. EnvironmentalDashboard.org supplements resource context; historical figures remain dated rather than silently presented as current.

The eight main colors above are from the original Google Doc shared by John on 25 September, verified through an authenticated export on 1 October. The document body is titled **Environmental Dashboard: Narrative Consistency Guide**. Exact export and provenance are in task `stripe-reference/dashboard-style-guide-original.txt` and its provenance JSON. Its GLSC/WSC and story-topic palettes belong to those clients/topics, not the general website. Its slide typography and word limit do not mandate shrinking or truncating website copy.

Optional Box photographs have not been newly verified. Do not label existing local assets as downloaded from Box. Real photos and working product evidence remain the visual subject.

## Full backgrounds with content in focus

Every page family and the footer share one quiet pale surface. `--site-surface` mixes 10% of the guide’s light green with its off white; all four scene surface variables resolve to it. This is a derived site surface, not a claimed exact guide swatch. The latest user correction supersedes alternating colored and dark chapters. Original imagery, readable ink typography and restrained source palette accents carry the subject changes. Added background curves are removed.

Color fills the scene but should not compete with its text or image. Avoid large blank white gaps between scenes, oversize empty gutters, decorative badges, tiny content surrounded by empty color, or new ornamental cards. Charcoal reading text provides contrast on colored fields. Use off white on charcoal; source bright green/blue are not white-text button backgrounds.

Remove standalone floating mascot decorations and extra character ornaments. Keep actual product illustrations, original photos, character-gauge evidence, stateful mood demonstrations and semantic communication icons. Controls and captions occupy explicit rows; they never cover essential image, chart or text content.

## Type and composition

Lato carries large regular-weight page headings, readable paragraphs, quotes, product names and controls. Retained identity/embedded story artwork may use Comfortaa. The website keeps Kwaku's accepted larger type regardless of historical aesthetic preferences. Desktop opening titles generally span48–64px; the home title spans52–80px. Phone sizing is local to the content, with full original words retained.

The common reading rail is1280px, with24px desktop and20px phone gutters. The navigation uses its own16px narrow-phone inset. Original image proportions remain intact. Evidence is larger, with gallery actions below photos and captions. Complete photos remain associated with their exact quotation and attribution.

Each scene communicates a complete thought. At375×667, long introductions, comparisons and evidence groups can become distinct semantic scenes. Pair a heading with its corresponding visual and a caption with its image. Similar Ecolympics posters require local scope/year labels. Complete forms, expanded settings and task lists can use native scrolling; never hide text simply to achieve a fixed height.

## Navigation and controls

One deliberate vertical gesture cuts directly to the next complete scene. There is no animated vertical journey or overlapping crossfade. Explicit chapter links, product selectors and Community Voices category links use the same discrete destination behavior. Preserve real wheel/touch behavior, momentum handling, reverse navigation, reduced motion, browser scrolls, native fragments, focus transfer, overlays and nested scrollers. This is a runtime contract, not CSS snapping alone. Only the current story owner is painted and focusable.

The footer owns a complete final viewport when collapsed and grows when disclosure groups open. A product directory category owns its related final link. Scene boundaries must not produce repeated fragments or blank strips.

Embed controls use a reserved row with44px minimum hit areas. Interact enables the child frame; Back to page and Escape restore page navigation and focus. Dynamic iframe replacements reuse their control row. Data-view explanation and chart/recovery states are mutually exclusive, including focusability. An iframe load event alone does not prove the remote chart has loaded.

Gallery Previous/count/Next controls have their own row. Product choices use native phone selectors and explicit desktop actions. Web appearance settings stay in a native disclosure; all preset controls, reset, code and provenance remain available.

Contact and Pricing prepare an email in the user's mail app; they do not submit to a backend. Hamilton's dashboard remains nonpublic. Do not invent metrics, testimonials, availability or partner destinations.

## Implementation and verification

The active refinement cascade is `stripe_refinement.css`, `stripe_shared.css`, `stripe_products.css`, `stripe_editorial.css`, `stripe_product_details.css`, `stripe_audiences.css`, `stripe_resources.css`, then `home_scene_fit.css` and finally `source_continuity.css`. Legacy component CSS remains for established behavior and real data drawings; the refinement layers own the current page treatment.

Before each UI task, read two relevant primary online references, inspect the actual target, and record specific patterns to avoid. Use installed Impeccable with the user's brief taking priority. After every build, obtain an independent visitor critique of the actual rendering, then repair concrete defects in a bounded batch. Automated geometry and source preservation supplement that review; they do not replace it.

Verify desktop1280×720, phone390×844 and short phone375×667. Where fonts/remote data are blocked, label the evidence accordingly. Never infer a live service outage from a deliberately blocked test. Keep artifact hashes and test results associated with the build actually tested. Do not package or deploy until coordinated review is complete.


## October 2 aesthetic application

Latest user direction: apply distinctive typography, committed color, purposeful motion and atmospheric backgrounds to Community Hub. The current presentation is a community publication grounded in the original Oberlin photography, rather than interchangeable software cards. Keep all source writing, imagery, native controls and story ownership intact.

- Headings: locally bundled Alegreya Sans Bold, licensed under SIL OFL in `public/fonts/alegreya-sans/OFL.txt`. Humanist, slightly calligraphic forms bring a human voice. Lato remains the reading/control face; Comfortaa remains the recognizable brand and embedded artwork face.
- Palette: pine `#244b38`, field `#eef2e8`, water `#e6f0ef`, leaf `#5bb951`, ink `#2c2c2c`, and paper `#f4f4f2`. Derived pine and pale fields complement the source Dashboard colors; they are not claimed to be exact guide swatches.
- Composition: left-aligned white opening text over the real drone footage, with an explicit Explore action. Directories use open linked rows grouped by purpose. Quiet full-scene fields replace bright interior title strips, while original product imagery carries the detail.
- Motion: one staggered opening reveal, omitted under reduced motion. No height tween on the hero; changing its height during startup moved downstream scene targets. Scene cuts remain immediate. Existing functional demonstrations keep their controls.
- Avoid: repeated white icon cards, saturated bars on every interior, split green emphasis over moving photography, ornamental diagrams, arbitrary decorative textures, generic repeated entrances, and hidden or overlapped gallery actions.

Primary references read for this pass: [Impeccable anti-pattern catalog](https://impeccable.style/slop/) and [NN/G aesthetic and minimalist design](https://www.nngroup.com/articles/aesthetic-minimalist-design/). The former guided removal of repeated packaging; the latter guided preservation of useful controls and content.

`community_aesthetics.css` now owns the final presentation layer. Current screenshot/build evidence and the independent visitor critique are in `tests/artifacts/aesthetics-20261002/`. The previous sections describe inherited constraints and history; this subsection supersedes conflicting typography, palette and title-bar descriptions.
