# Homepage source and final-decision audit

Recorded October 1, 2026. Implementation is paused. This document records findings only; it does not authorize or claim that the listed corrections have been made.

## Authority and evidence

- Live base: [CommunityHub.cloud](https://www.communityhub.cloud/), retrieved during this audit. Its homepage HTML, text, carousel links, and background-image URLs were inspected.
- Full transcript: `/Users/kwaku/Downloads/260930 Kwaku, Tanaka & John Website - transcription.txt`.
- Meeting analyses: `../tasks/2026-10-01-website-delivery/analysis-first-half.md` and `analysis-second-half.md`.
- User's latest direction: preserve the live site's writing and identity; reconcile the entire meeting before further development.
- Source locations below are relative to `site_ts/`; line numbers describe the paused state.

## Corrections to reconcile before resuming

The meeting's description of the homepage as an executive summary was not approval for blanket rewriting of established product descriptions. The eight new summaries should return to their corresponding live-site paragraphs, without new slogans or compressed substitutes.

| Product | Current rewritten source |
|---|---|
| Digital Signage | `src/content/home.ts:568` |
| Phone App | `src/content/home.ts:575` |
| Web Embeddables | `src/content/home.ts:582` |
| Building Dashboard | `src/content/home.ts:592` |
| Citywide Dashboard | `src/content/home.ts:602` |
| Data Hub | `src/content/home.ts:614` |
| Community Calendar | `src/content/home.ts:641` |
| Community Voices | `src/content/home.ts:648` |

Additional copy/design findings:

- `home.ts:171`: the new abbreviated global/local strapline follows the intended theme but is another wording variation. Use the established live wording.
- `home.ts:252-255`: revising the diagram captions is explicitly requested, but these three sentences are new draft copy. Keep the plain meeting explanation; remove unsupported flourishes such as “building a stronger community together.” The positively received transcript wording is “Community Hub provides a venue for everyone to participate.” The meeting did not approve a complete final caption set.
- `home.ts:273`: the accepted mission meaning was retained, but exact live fidelity still requires its original paragraph split, punctuation, and `CommunityHub` branding. This local paragraph predates the current edits.
- `src/styles/pages_home_delivery.css:63-65`: the newly introduced teal Motivate colors are an implementation invention. Restore the live palette while preserving clear section boundaries.
- Local additions such as the Stories objective panel (`home.ts:622-630`), Happening now (`home.ts:658` onward), and the final Hub section are not present in the retrieved live homepage in those forms. They predate this pass. Do not treat them as live-source-preserving merely because this pass left them unchanged; assess against the full approved scope before retaining or removing them.

## Original carousel associations and photo provenance

The live homepage supplies these primary product associations. Additional relevant buttons are supported by the meeting, but replacing established primary associations was not expressly decided.

All live image filenames below were read from the corresponding carousel item's background-image URL under `https://www.communityhub.cloud/wp-content/uploads/2021/10/`.

| Story | Live primary product | Live image filename | Local image currently used |
|---|---|---|---|
| Grace Gao | Digital Signage | `2062-scaled.jpeg` | `cwd-poster.jpg` |
| Kim Koos | Phone App | `children_screen.jpeg` | `kids-citywide-screen.jpg` |
| Scott Volmer | Web Embeddables | `glscscreenedit-01.png` | `glsc-exhibit.jpg` |
| Bob Mendenhall | Building Dashboard | `Studentengagement-scaled.jpeg` | `classroom-dashboard.jpg` |
| Janet Haar, resource use | Citywide Dashboard | `Haar-e1638938380201.jpeg` | `pp-janet-haar-dash.jpg` |
| Linda Arbogast | Data Hub | `953.jpeg` | `pp-linda-arbogast.jpg` |
| Janet Haar, calendar | Community Calendar | `1417-scaled.jpeg` | `street-event.jpg` |
| Geoff Hunter | Community Voices | `5100.jpeg` | `ts-kahn.jpg` |

My primary-CTA substitutions needing reversal/reconciliation are at `home.ts:68`, `82`, `96`, `142`, and `164` (Grace, Kim, Scott, Linda, Geoff). Preserve original associations and verify any added secondary destinations. The live Scott control has a Web Embeddables label but no `href`; repairing that destination requires a verified route, not a guessed external page.

Local photo definitions are in `src/content/catalog.ts:219-327`; Janet's resource-use and Linda's overrides are at `home.ts:119-123` and `135-139`. Different filenames alone do not establish different image content. Exact image equivalence has not been checked for all eight. Grace's local source is a dashboard illustration and Geoff's is a chart screenshot; these cannot be presented as verified preservation of the live photographic assets.

The existing local quote strings also contain earlier punctuation/branding/attribution adaptations. This pass did not rewrite those strings, but that is a narrower claim than matching the live site. `tests/fixtures/existing-testimonials.json` freezes the local baseline: passing its invariance check does **not** establish live-source fidelity.

## Final meeting decisions, including later qualifications

| Final outcome | Transcript clock / qualification |
|---|---|
| Preserve opening skip/navigation and its automatic completion transition. | 11:34:32–11:35:01. |
| One automatically advancing story; visible manual forward control; complete substantial photos; contextual buttons. | 11:35:01–11:40:33. New host testimonials require genuine source quotes and matching location photos. |
| Preserve original mission language and guide visitors through identity, Engage, Educate, Motivate/Empower. | 11:54:16–11:58:35; compact thematic grouping reaffirmed 12:01:12–12:02:24. |
| Identity plays first, pauses for reading, then diagram plays; do not run competing loops. | 11:46:48–11:51:59. The initial no-repeat preference was softened: repeating the entire sequence after a long dwell is acceptable; approximately one minute was an example, not a fixed requirement. |
| Use the Community-centered communication platform label and matching hands identity; remove Apart/Hub/Web controls. | 11:48:51–11:51:38. |
| Rewrite awkward diagram captions using the actual human explanation. | 11:52:17–11:56:26. This targeted request does not authorize rewriting all established homepage descriptions. |
| Repair snapping, sensitivity, and discrete story ownership; retain an explicit down arrow alongside scrolling. | 12:17:07–12:20:13. Later acceptance resolves the earlier disagreement about arrows. |
| Direct product/dashboard navigation to useful selected content, with partner context opening separately; Hamilton stays nonpublic. | 12:08:50–12:16:35. |

Not final mandates: centering Who We Are (placement flexibility explicitly accepted); eliminating all white backgrounds; replacing all fonts; removing every geometric motion (Madeleine preferred some coming-together motion); choosing a new palette; randomizing the story order. Font hierarchy and excessive spacing do require repair, in the components actually reviewed.

Deferred: phone-app terminology and wrapper/home-screen product work (12:02:50–12:06:40); testimonial-title audit assigned to John/Madeleine as a second pass (12:06:39–12:07:27); missing verified partner pages/assets and new host quote/photo pairings. No current title or quotation should be invented.

## Copy-policy conflict

`src/content/copy-policy.json` prohibits `learn more` and en/em dashes. The live source contains established Learn More controls and em-dash punctuation. Exact source preservation must take precedence: revise or scope the guard for preserved source text when implementation resumes. Do not silently rewrite approved source copy to satisfy an older generic copy policy.

No implementation, fixture, or policy corrections were made as part of this audit.
