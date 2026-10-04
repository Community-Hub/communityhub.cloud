# Frontend composition and maintenance

## Boundaries
- `home-previews.ts`: one safe source-backed renderer for passive image, native-data and calendar examples. It owns example context and media, never product navigation. `home-voices-preview.json` contains verified exact source words and image-coordinate provenance for the narrow readable presentation.
- `home_previews.css`: shared product identity, preview stage, readable context, responsive source imagery and44px controls. Chapter type, control outline/stroke, caption size and radius are tokens. The original brand's typefaces and pale civic surface remain.
- `base.ts` existing story player: one12-second reading policy (18seconds for Building), gated by reduced motion, visibility, hover, focus and active-product ownership. Manual interaction latches pause; explicit Play resumes. Product switches reset a complete reading interval. No carousel timer calls product navigation.
- `deferred-frame-policy.ts`: testable network-activation boundary. Intersecting but inert/hidden product content cannot request its iframe; ownership changes trigger a fresh eligibility check.
- `pages_home7_eng.ts` and `pages_home6.ts`: vertical product ownership and scene restoration. Product tabs remain explicit navigation. Generic horizontal content rails do not own homepage products.
- `communication-network.ts`: recovered original participant relationships, located in About. It is independent of the source presentation on Products.

## Retired or corrected code
- Removed the old invisible1px Engage heading rule rather than stacking another visibility workaround.
- Removed the old Calendar/Jobs controller and CSS imports from production. The35 generated page bodies contain neither data-ct nor data-jobs; those retired source files remain for historical reference, not shipped runtime.
- Replaced homepage full interactive Stories/CV context renderers with the dedicated passive renderer. Full product-page controls are retained.
- Replaced the section-skipping arrow loop with a single navigation step.
- Removed120ms/300ms layout polling in favor of coalesced input/layout/content events.
- Corrected existing opening typography and native controller dimensions in their active stylesheet, rather than duplicating those components.

The legacy site still has accumulated stylesheet layers outside this scoped refactor. A whole-site CSS rewrite was deliberately avoided while preserving unrelated content and established behavior. The new component has an explicit boundary; its added size is reported rather than claiming that the full stylesheet became smaller.

## Source media
Desktop CV retains unchanged native source compositions. Narrow CV crops only the actual photograph rectangle at render time and pairs it with source-verbatim semantic quote/attribution; it does not fabricate photography or claim camera-original resolution. Stories uses native Google slide PNG exports and a readable narrow transcription. The exact original exhibit JPEG is preserved. Local Story of Dashboard frames are a versioned presentation snapshot, starting at verified platform slide14, with31frames and the official source link; future source-deck edits do not automatically update this snapshot.

## Final review corrections
- Stories is classified under Educate in the shared catalog, matching the final meeting's homepage taxonomy and all generated menus/directories.
- Community Voices retains the existing native institution/category controls in its product page's dedicated Explore section; the homepage remains passive.
- Native phone controllers now render at their actual iframe viewport rather than scaling a fixed390px screenshot-like canvas. The application remains responsible for its responsive layout; browser verification is required.
- The Campus opening uses the verified original Science Center photograph rather than enlarging a491×368 orb thumbnail. Neighborhoods uses the exact official site's24-word platform mission sentence, not the accidentally duplicated Calendar product paragraph (source: https://www.communityhub.cloud/).
- Source-authorized Data Hub platform explanation now also uses the genuine31-frame deck, landing at diagram14. The unused custom diagram runtime and two stylesheets are no longer imported into production.
