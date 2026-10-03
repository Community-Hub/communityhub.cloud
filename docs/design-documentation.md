# Design documentation evidence

Recorded October 1, 2026 for the local TypeScript reconstruction. This pass changes only `DESIGN.md`, `.impeccable/design.json`, and this evidence note.

## Authority and scope

The Impeccable document playbook was read and its context command run once. There was no existing root `DESIGN.md` or `PRODUCT.md`. This is scan-mode documentation of an implemented visual system; it does not invent product context or replace the approved direction. Product truth comes from [content-and-design-brief.md](content-and-design-brief.md). The narrative and visual contract come from [REVISED_DESIGN_DIRECTION.md](../../tasks/2026-10-01-website-delivery/REVISED_DESIGN_DIRECTION.md), including its synthesis of the complete meeting and preservation of CommunityHub.cloud's original writing and photographs.

The north-star wording is taken directly from that direction contract. Other descriptive language names observable implementation roles. No new photographs, claims, testimonials, product decisions, source edits, test changes, configuration changes, or memory updates are part of this pass.

## Extraction boundary

| Evidence | Role in documentation |
| --- | --- |
| `src/styles/index.css` | Establishes stylesheet order. The delivery styles follow inherited styling. |
| `src/styles/base.css`, especially its late v6 overrides | Active shared colors, font stacks, container, section spacing, buttons, header, footer. The older purple values at the file start are superseded. |
| `src/styles/pages_home_delivery.css` | Current photographic homepage, type roles, scene grounds, natural media, consolidated controls, phone mission scenes, and first-review corrections. |
| `src/styles/pages_delivery.css` | Flat product directory, connected platform diagram, compact interiors, live toolbar, phone Hub-label correction. Later declarations supersede the earlier rounded product rows in the same file. |
| `src/styles/pages_zzz_polish.css`, `delivery_navigation.css`, `pages_home6.css`, `pages_home9_slide.css`, `pages_zzzz_fit.css` | Retained control radii, focus, elevation, navigation hierarchy, measured story layout, and transition context. These are not blanket authorization to reapply the older card composition. |
| `src/styles/pages_zprod_a.css`, `pages_resources.css`, `pages_zz_pop.css` | Existing fields, resource filters, inherited cards, and photographic next links. |
| `src/components/Header.astro`, `src/layouts/PageLayout.astro`, `src/content/home.ts`, `src/content/products.ts`, `src/scripts/pages_home9_fade.ts` | Actual navigation, font loading, labels, composition, source content, and story behavior. |

`DESIGN.md` owns the extracted primitives. Its sidecar is schema version 2 and contains only extensions, representative self-contained component snippets, and matching narrative. Color ramps in the sidecar are explicitly synthesized preview ramps in OKLCH; they are not new approved CSS tokens. Existing CSS custom properties are referenced with literal fallbacks in component snippets so previews remain usable outside the site's document. The snippets show appearance and native states; they do not implement the application's carousel, routing, embed, or tab controllers.

Documentation checks passed: YAML and JSON parsing, eight canonical sections in order, all token/component references, matching narrative, ten component previews, 23 eight-step preview ramps, and resolving local evidence links. The sidecar previews were not separately browser-rendered. No application tests were rerun by this documentation pass.

The parent's final [Impeccable source scan](../tests/artifacts/website-delivery-20261001/impeccable-reconstruction-scan.json), run with these design artifacts, reports five primary findings and 98 advisories (28 color, 58 font-size, 12 radius). The parent identified four known arrow/unused-legacy findings; the fifth is the older `pages_home7_eng.css:57` quote border, overridden by the delivery stylesheet's `border:0`. Many advisories concern inherited or overridden declarations, while others are local values intentionally outside this concise reusable token set. The scan is retained without suppression. Documentation follows the active cascade and does not promote every historic declaration into a design rule or change styles simply to eliminate detector output.

## Visual evidence and status

The [independent reconstruction review](../../tasks/2026-10-01-website-delivery/parent-reconstruction-review.md) identified the Engage media footer, phone opening, phone mission sequence, and phone Hub-label placement for correction. This documentation records the corrected source and supplied evidence; it does not independently approve those corrections. The final source also includes the subsequently reduced phone opening type, short-phone announcement-aware media/type sizing, and removal of the blanket phone introductory-media hiding rule. Those later source changes are documented directly; the earlier capture set is not proof of their rendering.

The [confirming capture gallery](../tests/artifacts/website-delivery-20261001/reconstruction-confirmed/index.html) and its `inspection.json` contain 42 live captures across 390×844, 1280×720, and 1920×1080. All report zero horizontal overflow. The documenter directly viewed the 1280px testimonial, 390px Engage, 1280px product index, and 390px platform model to check the extracted visual vocabulary. This is a bounded evidence review, not a new browser pass.

The inspection log records one remote dashboard error in `dashboards-first-1280.png`: failure to fetch the hosted City of Oberlin dashboard's dynamically imported plugin module. A local frame or screenshot does not prove that external content loaded. This note does not classify the external error as a new local regression.

At documentation time, **parent visual correction review and final technical results are pending**. The folder name `reconstruction-confirmed` is not final acceptance. Physical-device acceptance, production deployment, and user approval are not established by this documentation pass. The parent delivery record owns subsequent verification and acceptance updates.

Source-dependent follow-ups remain in [JOHN-FOLLOW-UPS.md](JOHN-FOLLOW-UPS.md), including attribution audits, additional verified host material, exact partner embedding pages, and phone-app terminology. Hamilton remains nonpublic. None of these gaps is filled by invented content here.
