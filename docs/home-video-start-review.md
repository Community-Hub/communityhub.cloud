# Homepage video-start correction: independent visitor review

**PASS — bounded review of the build completed October 1, 2026 at 21:17:34 local.**

Final `dist/index.html` SHA-256: `7397c86187b14f0625eac35d977546407ab849113f01db16be0790992da43546`. Hash rechecked after the entire run. The reviewer made no source changes or builds and opened no visible browser tabs.

## Scope and research

Read the project AGENTS instructions and incumbent design context using the installed Impeccable skill. This is a narrow behavioral verification, not a fresh aesthetic critique or redesign. No UI edit was performed.

Primary design references read:

- [W3C WAI Page Structure](https://www.w3.org/WAI/tutorials/page-structure/): preserve understandable orientation and access to the intended section.
- [NN/G Usability Heuristics](https://www.nngroup.com/articles/ten-usability-heuristics/): preserve predictable navigation, user control and established browser expectations.
- Technical reference: [MDN scrollRestoration](https://developer.mozilla.org/en-US/docs/Web/API/History/scrollRestoration), distinguishing manual versus automatic history-position restoration.

Patterns to avoid: entering at an unexplained later scene on a deliberate homepage visit; delayed reset after the visitor starts navigating; globally disabling Back position restoration; redirecting a section link to the video; overlapping duplicate story owners or controls while startup settles.

## Independent rendered behavior

Headless Chromium served the actual `dist` through the test LocalSite server. Viewports: 1280×720 and 390×844. Reduced motion was enabled; external network requests were blocked, so screenshots use available local assets/font fallback and do not claim remote resource availability. Each navigation allowed delayed startup fitting to finish. Genuine wheel input moved from the opening scene to the next scene.

| Action | Desktop | Phone |
| --- | --- | --- |
| Fresh homepage visit | Film scene, y1 | Film scene, y1 |
| Wheel into later scene | `people`, y643 | `people`, y767 |
| Reload from later scene | Film scene, y1 | Film scene, y1 |
| Click logo from later scene | Film scene, y1 | Film scene, y1 |
| Direct `#problem` visit | `problem`, y1286 | `problem`, y1534 |
| Back after leaving later scene | `people`, y643 restored | `people`, y767 restored |

`history.scrollRestoration` returned to `auto` in every settled state. The source guard is limited to the homepage and excludes hash and `back_forward` visits. No later timer-based reset was introduced.

The earlier 21:15:10 build independently failed the reload check and was not approved. A first observation attempt on the corrected build hit a transient missing-runtime condition while the shared output was changing; the completed run above used stable final output and its unchanged hash. No application pageerror appeared during the completed run. Blocked external resource console errors and cancelled local media-response broken pipes were expected from the test's network rules/navigation.

## Visitor perspective and evidence

Visually inspected the actual desktop and phone opening/reload screenshots plus the preserved section/Back destinations. The local community film/poster and its introductory heading clearly own the first scene. The header and announcement occupy separate rows; the heading is readable over the imagery and the Explore action is visible with its own space. Phone layout retains the same first-scene message and a readily reachable Explore control. No new text/control overlap or visual noise was introduced by this behavioral change.

The correction restores a coherent introduction when visitors deliberately enter or reload Home. Section links still open their promised content; Back restores the visitor's prior story instead of restarting the introduction. These outcomes match the requested distinction.

Evidence directory: `tests/artifacts/home-video-start-review/`:

- `1280-fresh.png`, `1280-reload.png`, `1280-hash.png`, `1280-back.png`
- `390-fresh.png`, `390-reload.png`, `390-hash.png`, `390-back.png`
- `evidence.json`: measured owners, scroll positions, hash and restoration state for all actions.

No unresolved finding remains within this narrow review. This report does not expand scope to unrelated page styling, remote video availability, or every browser engine; the parent owns broader automated coverage.
