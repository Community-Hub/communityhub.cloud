# Platform explanations: current implementation and source provenance

> Later October 2 revision: Products `#how` now displays the original Story of Dashboard slideshow. The slide-10 component described below remains on the Data Hub page only. See [the Products revision](original-story-revision.md).

## Scope of the earlier slide-10 correction

The user identified the dark “How the Dashboard Platform Works” component on Products and asked for the supplied presentation's slide 10 explanation. This replaces the former generic card-based model. The same component is used in Data Hub's Data Manager section, so both routes receive the reconstruction.

The accepted centered homepage Who We Are composition is separate and unchanged by this correction. It retains the original hands/product motif, exact mission paragraph and About link. Its first uninterrupted sequence may advance once; the interior model never advances the page.

## Slide 10 source

The implementation was checked against the original slide XML, relationship file, individual embedded assets and slide contact sheet. The source XML contains four click groups:

1. Building Performance data enters the Hub; Building Dashboard and Hub Analytics appear
2. Environmental & Municipal Data enters the Hub; Citywide Dashboard appears
3. Social Data & Storytelling enters the Hub; Calendar & Jobs Board and Community Voices appear
4. For engaging people: Web Embeddables, Phone App and Interactive Signage appear

The web version keeps eight readable narration stops within those four groups: building input; Hub collection; building/analytics applications; environmental input; Citywide; social input; calendar/voices; public delivery formats. It retains the slide-specific Building Dashboard label inside the explanation. The surrounding product directory's approved Data Dashboard naming is unchanged.

The source/Hub framework is visible immediately. Original line illustrations sit beside the slide's peach, green and blue labels; the Hub uses its actual collection ring and hands. Application symbols are unboxed and arranged in the slide's groups. Two original output photographs and the actual Oberlin Hub phone menu complete the explanation. No whole-slide image, deck iframe, generic node-card replacement or WhatsApp screen is used.

## Individual assets

All assets below are unmodified extracted originals in public/assets/platform-explanation/. The copied original bytes and SHA-256 hashes are recorded in slide10-provenance.json in that folder.

- image69.png → building-sources.png
- image57.png → environmental-sources.png
- image70.png → social-sources.png
- image62.png → hub-collects.png
- image66.png → hub-hands.png
- image61.jpg → web-embeddables.jpg
- image166.png → interactive-signage.png
- image50.png → analytics-heatmap.png
- image60.png → analytics-lens.png

These newly copied originals total 3,109,394 bytes. The 2,896,393-byte signage image is retained at original quality. The release packaging may place this complete asset folder in the second media archive; paths remain the same when both archives are extracted into the source root.

Previously extracted application symbols are reused unchanged:

- image64.png → building-dashboard.png
- image55.png → citywide-dashboard.png
- image84.png → calendar-jobs.png
- image52.png → community-voices.png

Slide 10 image58.png is a stock WhatsApp photograph. It is intentionally excluded and replaced with the already-verified public/assets/phone-workflow/oberlin-hub-menu.png. This substitution prevents presenting another product's screen as Community Hub.

The source illustrations include their own arrows. Their meaningful illustration portions are displayed through native CSS viewports; native SVG dotted connections reproduce the source relationships in the responsive layout. Hub collection points are native SVG/CSS rather than an unpausable GIF, so the cue obeys the same playback holds.

## Behavior and accessibility

- Existing eight captions and product destinations are retained
- Automatic reading interval is 4.2 seconds per stop; the final complete model holds
- Whole-section hover, keyboard focus, offscreen state and hidden documents preserve the exact unspent interval
- Hub collection points run only during collection stops and pause with the explanation
- Manual previous/next arrows opt into stable step-by-step inspection
- At the final stop, Next becomes an accessible Replay action without replacing its SVG
- Quiet chevrons reveal from whole-content hover/focus and remain visible on touch
- Reduced motion and no JavaScript show the complete readable model
- Narrow layouts keep native internal scrolling; advancing selects the corresponding source, Hub, application or output group
- No page auto-advance is added to Products or Data Hub

## Files and verification boundary

Implementation: src/content/hub-flow.ts, src/scripts/hub_flow.ts, src/styles/hub_flow_source.css and the existing hub_flow_controls.css. Styles are imported through src/styles/index.css.

Focused tests cover all eight stops, source assets and links, the always-visible Hub foundation, absence of whole-slide/WhatsApp content, preserved chevrons, reduced motion, idempotence and exact overlapping pause/resume time. Source contracts were written failing before the reconstruction.

Production build, source tests and actual private hosted rendering are recorded separately in the handoff’s `QA-STATUS.md`. The source-led desktop sequence, controls, replay and narrow layout were reviewed; source checks alone are not treated as visual verification.
