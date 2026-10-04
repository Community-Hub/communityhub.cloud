# Community Hub: source and final-decision brief

Reconciled October 1, 2026, before resuming development. This brief supersedes assumptions that the inherited prototype's copy or every suggestion in the transcript was approved.

## Source order

1. Kwaku's latest instruction: use https://www.communityhub.cloud/ as the base and preserve its writing. Avoid generic AI writing and design.
2. The final decisions across the complete September 30 meeting, including later resolutions of earlier disagreements.
3. Original slides and other verified source material actually discussed in that meeting.
4. Implementation choices that serve those decisions. They must not invent facts, testimonials, product promises or a replacement brand voice.

The full transcript, both half-meeting analyses, the 65-item decision ledger and the 12 implementation work packages were reviewed together. The recorded prototype is evidence of a problem, not automatically an approved design. The older live site supplies content; the meeting supplies changes to its presentation and navigation.

## Decisions to implement

| Area | Final direction | Boundary |
| --- | --- | --- |
| Opening and stories | Skippable forward-only introduction; navigation available; one automatically advancing story; complete photo; visible horizontal controls | Preserve live writing and original primary product associations. Add a contextual secondary destination only when supported. |
| Vertical navigation | One deliberate gesture advances one story; keep a down arrow as an additional control | Later agreement at 12:18:27–12:20:13 resolves the earlier disagreement. Preserve touch, keyboard, deep links, reduced motion and nested scrolling. |
| Identity | Identity animation, reading pause, then connection diagram; hold the final state | A long-dwell repeat is permitted, not required. No requirement to center every heading. |
| Communication diagram | Heading “Community-centered communication platform”; matching hands mark; no Apart / Hub / Web selector | Natural captions explain existing organizations, participation and connections among peers. Do not rewrite the accepted mission. Removal of all motion or all captions was not agreed. |
| Homepage narrative | Local/global problem, diverse real stories, mission, Engage, Educate, Motivate and Empower | Compact thematic groups and useful links. “Executive summary” does not authorize replacement product prose. No blanket prohibition on white. |
| Product menu and interiors | Readable top-left heading/description hierarchy; useful content on arrival; consistent cards | Removing an introductory barrier does not authorize dropping the underlying text or imagery. |
| Platform explanation | Preserve “How the Dashboard Platform Works:” and its source relationships; reveal them sequentially at a readable size | Use `public/assets/deck/h10.jpg`, matching meeting frames 2290 and 2390. The criticized frame 2360 is not the preferred model. Do not substitute generic Collect / Make sense / Share cards. |
| Dashboard selection | Open the chosen public dashboard with truthful loading/failure feedback | Keep a separate route to the case narrative. Preserve selection on direct load and navigation. |
| Partner context | Consistent verified partner-site link in a new tab | The Science Center's exact dashboard embed is confirmed. The City's Sustainability page currently embeds Community Calendar; the City Data Dashboard host remains unconfirmed. College and school pages provide dashboard links; exact embed-host pages remain follow-ups. |
| Hamilton | Keep nonpublic | No live private endpoint, screenshot or invented public demonstration. |
| Remaining destinations | Verify each exposed action reaches useful content | The “no place” remark does not identify a control conclusively and does not authorize deleting the lesson catalog. |

## Content correction required by the audit

- Restore the live homepage paragraphs, original testimonial wording and verified photo associations. A test proving preservation of the earlier local draft is insufficient.
- Restore original primary testimonial CTAs where they were replaced without a meeting decision.
- Restore established product names and descriptions in shared catalog/menu copy; distinguish Building Dashboard and Citywide Dashboard. Keep useful existing destinations, including material beyond the old homepage, available.
- Replace new generic platform stages with the original data sources, The Hub, visualization applications and communication venues.
- Preserve source punctuation and labels. The inherited copy guard must not force changes to approved source text merely because it contains an em dash or “Learn More.”
- Keep new interface text factual and short. Draft diagram captions are the expressly requested editorial exception.

Detailed audits: [Homepage](source-audit-home.md) and [Products](source-audit-products.md).

## Unresolved or deferred

- John and Madeleine's testimonial name/title audit and verified host quote/photo pairings from the Cleveland Foundation proposal and Midtown/Cleveland decks.
- Final Phone App naming and future native-wrapper/home-screen preferences. Existing source wording is retained without adding app-store availability claims.
- Exact partner pages hosting the City Data Dashboard and the college/school embeds. The City's current Sustainability iframe is Community Calendar, not the selected Data Dashboard.
- Exact destination/control associated with the recorded “no place” complaint.
- Tentative next-day meeting time was scheduling discussion, not a confirmed appointment.

The consolidated [questions for John](JOHN-FOLLOW-UPS.md) also retain earlier source-dependent chart, orb-viewer and research follow-ups without treating the older note as current verification.

## Design quality and tools

Use the real photography, existing green identity and distinct section colors as the visual starting point. Make hierarchy, spacing, readable diagrams and purposeful motion do the work. Do not invent filler headlines, decorative statistics, interchangeable marketing cards or product claims to fill the layout.

Installed and in use at Kwaku's request: [Impeccable](https://github.com/pbakaus/impeccable). The failed terminal install ran from `/` after a stale project path failed. Codex installation succeeded from the actual Community Hub project; its context, polish and craft-floor guidance have been read. The project hook manifest is installed and configured. Figma and Product Design tools are also available in this Codex environment.

Tooling supports review; it does not replace the content sources or the final meeting decisions.

## Verification boundary

The working changes are local and not yet an accepted release. Earlier tests preserved the local prototype, not the live source. The current comprehensive run has exposed pricing/contact story-isolation issues, and the navigation audit found arrow overlap at several viewports. Correct these, rebuild after the content corrections, and inspect real desktop and phone rendering before calling the result complete. Chromium automation is not a physical-device acceptance test.
