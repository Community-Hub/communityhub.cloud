# Independent visitor review — UI foundation

Reviewed October 1, 2026 by the independent visitor-review agent. No product source edits or builds were performed by this reviewer.

## Authority and bounded research

Read `AGENTS.md` and `../tasks/2026-10-01-website-delivery/DESIGN_RESEARCH_RULES.md` before inspection. Primary sources read:

- [W3C WAI: User Notifications](https://www.w3.org/WAI/tutorials/forms/notifications/): field errors should identify the problem and correction, remain associated with the field, and submission feedback should distinguish actual success from an intermediate state.
- [NN/G: Aesthetic and Minimalist Design](https://www.nngroup.com/articles/aesthetic-minimalist-design/): retain task-relevant information and controls while avoiding distracting decoration.

Task-specific patterns to avoid: placeholder-only labeling; color-only validation; false “sent” confirmation for mailto handoff; decoration competing with recovery controls; unreachable controls after dynamic content increases form height. The existing site direction was preserved; this was not an aesthetic redesign review.

## Tested build

Built HTML modification time: October 1, 2026, 20:38 local. SHA-256:

- `dist/contact.html`: `a953373efd6f30157a042ad283b4859816a9050ec4f1fd913534ef29fe9a725b`
- `dist/pricing.html`: `ddefda7549fe407781b868983d76c30721c236119ce11c8af8b3ebf02de58bb7`

Runtime source SHA-256 at review:

- `src/scripts/ui/async-region.ts`: `c7d093b7beb9b0cff062dc374f8c131d3b6feb15f4f0ab3225e41f3fca7b9c21`
- `src/scripts/ui/email-form.ts`: `c0e12a1e046ae92220bd3b2abe8903ca42bdb152f3c2bba685be4b0432c615ec`
- `src/scripts/ui/state.ts`: `a00b35c2986d3c812179407a79b731b28ee6481efc16b0fae29cde5defe30535`

The development-only example was inspected live at `http://127.0.0.1:4338/ui-examples/foundation`; it is not part of this production build hash. The original underscore-prefixed route returned 404; the parent corrected the route before review.

## Actual rendered inspection and visitor findings

Headless Chromium inspection served the current `dist` from a local HTTP server, without opening visible tabs or sending email. Contact and Pricing were exercised at 1280×720, 390×844 and 375×667, including empty submission, keyboard Enter, correction of required fields, and a long draft that produces a copyable recovery textarea. Pricing used the actual `#quote` destination. Native wheel navigation reached the Contact form.

- Contact clearly presents inquiry guidance and an email preparation action. “Prepare my email,” the explanatory copy, and “Nothing has been sent” accurately set expectations.
- Pricing's “Tell us what you are pricing” heading and native product selector make the next action clear. The error text remains legible and associated with the required fields.
- Empty submit focuses the name field on both forms. Visible focus treatment is strong. Required labels, textual error messages and the summary avoid color-only feedback.
- At phone widths, field labels and controls stay within the viewport, with no horizontal document overflow. Long recovery content extends the form vertically; focusing the final “Open your email app” link brings it to approximately y380 with a 46px height on 375×667. Hit-testing its center resolves the link itself on both pages. No essential control overlap was observed in those states.
- The example page is clearly identified as simulated development content. Its phone layout has readable hierarchy, restrained dividers, full-width fields and no horizontal overflow. The actual No results, Connection error and Results states were exercised. Each empty/error message gives the next action; successful results replace the state without leftover retry controls.

Evidence: `tests/artifacts/ui-foundation/review-contact-*-errors.png`, `review-contact-*-recovery.png`, `review-pricing-*-errors.png`, `review-pricing-*-recovery.png`, `review-contact-recovery-focus.png`, `review-pricing-recovery-focus.png`, `review-example.png`, and `visitor-geometry.json` (Pricing geometry).

## Concrete finding and required confirmation

The short-phone initial Contact scene exposes the unavailable Next section button to accessibility queries although it has opacity zero and pointer events disabled. A role-based click targets an invisible action and is intercepted by scene content. This is an accessibility exposure defect, not a visible overlap: the screenshot does not show that button in this state. The parent identified the existing unavailable-control logic and proposed `aria-hidden` plus `visibility:hidden` when `.is-on` is absent. Confirm this scoped fix on the next build before delivery. Native wheel navigation works.

The component renderers/controller review found no additional material accessibility issue within this bounded scope. Native labels/controls, persistent polite status regions, escaped text, inline error associations, stale-response prevention and retry focus recovery are present. This inspection is not a claim of assistive-technology certification or real external mail-client delivery.

Disposition: rendered components and Contact/Pricing error/recovery behavior pass this bounded visitor review; final gate remains pending the unavailable-next-control repair and confirmation against the final build.

## Final build confirmation — 20:43:39 local

Repeated the bounded checks against the rebuilt `dist`, without rebuilding or editing product code. Final HTML SHA-256:

- `dist/contact.html`: `974f1ca5e9cd3d36f1719373b94c91e6fc548a3b4ce78e8f7b35e9fbf642a902`
- `dist/pricing.html`: `f4c7be09c8cde664ff06db3007ac13c2ebdeb5585abf35bbf48cae9b1ef93b44`

The reported navigation issue is resolved. On initial Contact at 375×667, the unavailable button has `aria-hidden="true"`, computed `visibility:hidden`, and zero matches in the accessible Next section role query. At 1280×720, the available control has `aria-hidden="false"`, computed `visibility:visible`, and one accessible role match. A real pointer click advances the story's current position from y0 to y643.

Contact and Pricing invalid submissions still focus the first invalid field and provide inline errors plus summary after the empty-live-region CSS adjustment. Their long-draft recovery links remain reachable and unobstructed at 375×667: focus brings each link to y380 with approximately 46px height, and pointer hit-testing identifies the actual link. The final error and recovery screenshots were visually inspected: `final-contact-errors.png`, `final-pricing-errors.png`, and the refreshed `review-contact-recovery-focus.png` / `review-pricing-recovery-focus.png` under `tests/artifacts/ui-foundation`.

Final disposition: **PASS for this bounded visitor-review gate.** No unresolved material finding remains in the reviewed components, Contact/Pricing integration, or scoped navigation repair. The previously stated mail-client and assistive-technology certification limitations still apply.

## Final native-validation guard confirmation

Confirmed the subsequent nonvisual repair in `src/scripts/ui/email-form.ts`: validation clears prior custom validity, then returns without validation when `control.willValidate` is false. This preserves native disabled-field behavior. Independently ran three browser regressions successfully: disabled required control; ordinary Contact required-field focus, repair and encoding; Pricing validation and native select.

Latest build SHA-256 (supersedes the preceding hashes):

- `dist/contact.html`: `ae97a7cbb328217f8370ea257e52084a3e1b069be43fdc2dfdedea5eee5842ca`
- `dist/pricing.html`: `5ef89c2251eb9a73990e4b381ca6e378845739aa063176cacc24185c3e4b98aa`
- `src/scripts/ui/email-form.ts`: `bf5935ce80a554fdb28c915f4bf88db9d71cb965617fc6e2204e2caf2b0984f6`

Repeated actual long-draft preparation on both built pages at 375×667. After allowing the story layout to settle for 600ms, both recovery links are exposed to accessibility queries, have no inert ancestor, receive focus at y380, and pass pointer hit-testing. Ordinary settled behavior is unchanged. No aesthetic review cycle or product edit was performed.

Timing limitation discovered during additional probes: forcing focus programmatically onto a newly inserted recovery link immediately after submit can race the existing story layout measurement, intermittently moving the form scene and marking it inert. Waiting for layout settlement removes the condition. This is reported to the source owner as a separate dynamic-layout timing concern; the native-validation guard and its normal settled flow pass. It should not be interpreted as proof that every possible immediate focus sequence is covered by the earlier bounded pass.

## Immediate-focus timing repair confirmed — final build 20:50:31

This confirmation **supersedes the timing limitation above**. Read the new `onLayoutChange` callback integration and independently ran `test_new_recovery_link_accepts_immediate_focus_without_scene_race` against current production `dist`: passed for Contact and Pricing at 375×667. The regression submits and focuses the newly inserted recovery link within the same JavaScript task, before ResizeObserver settlement; it verifies actual focus, no inert ancestor, and bounds within the usable viewport.

Also reran the independent immediate-focus recovery probe that previously reproduced the problem. Both routes now report one accessibility-role match, `inert=false`, link top approximately y380 and height46, and a center hit-test on the actual link. No wait for layout settlement was inserted before the focus operation.

Final authoritative SHA-256:

- `dist/contact.html`: `2e94cc410cf62cdcc376b8e00b760d3485b819fcfe805b12e6540cf5b95cd5d7`
- `dist/pricing.html`: `e32251102fa3521fc54f310ad81f260256a4970dba9b0c5718f6b5a718aa24ac`
- `src/scripts/ui/email-form.ts`: `67ecd9008c097c308ac5ebd482df0773932b4862c53f8b504abc263a40b5cbb3`

Final disposition: **PASS**. The concrete timing defect is repaired and independently confirmed on this build; no unresolved finding remains within this bounded review. No rebuild, product edit, or aesthetic redesign review was performed for this confirmation.
