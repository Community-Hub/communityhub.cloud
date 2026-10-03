# October 2 navigation revision

Status: independently accepted after source checks and actual private V23 browser review.

## Final meeting agreement

The final exchange at 12:08:32–12:09:11 distinguishes product navigation from example navigation: downward page scrolling advances Digital Signage to Phone App, while arrows and automatic rotation change examples only within the selected product. The visitor does not need to exhaust examples. Reverse traversal follows the same order. The final Building Dashboard exception keeps its own visible internal scrolling (12:11:16–12:12:51 and12:16:32–12:16:48). The earlier proposal to make all outer scrolling operate embedded applications was abandoned. No numeric gesture threshold, cooldown or physical-input algorithm was agreed in the meeting.

Actual video frames inspected at recording positions 01:06:45,01:06:51,01:06:53 and01:09:31 show the category heading and product tabs, separate example arrows and the Building Dashboard. They are reference-only meeting frames, not public site assets.

## Root causes and changes

- The old wheel handler discarded every subsequent event until both 260ms of quiet and 450ms after a step, including deliberate opposite input. A 107ms reversal was reproduced in the hosted build. Boundary attempts consumed that same latch even when nothing moved.
- WheelGesture now owns a directional burst, retaining the 260ms quiet threshold and removing the additional 450ms hold. A meaningful counter-stroke cancels the previous direction. Tiny sign jitter and continued momentum remain consumed. Finite subpixel events retain timing/native ownership. Boundary attempts release ownership immediately.
- The narrow layout only measured the selected product's copy/media. After those reading stops, vertical input skipped the category's other products. Product navigation now crosses the same semantic product sequence on narrow screens, remeasures each selection synchronously, and lands at its first or last complete reading frame. Horizontal tabs still provide direct selection; within-product example playback remains independent.
- Web Embeddables uses the existing live calendar-feed component with current Cleveland events and their real event destinations. A normal cross-origin calendar iframe was tested and still captured its own wheel input, so that iframe is no longer used for this brief homepage example. The complete native calendar remains on its detailed page. Valid empty data and network failure have distinct truthful states; failure exposes a conditional source link.

- Viewport and breakpoint changes now retain the selected semantic product instead of recalculating it from obsolete pixels. The previous narrow reading-part number is not reused as the desktop product index. Closing the mobile menu restores the story captured before its overflow/layout change.
- Redundant normal-state homepage full-size/partner/chart links are hidden, preserving one product action, native controls, specific chart help, screen-reader status and detail-page source/recovery links.

## Verification

The source passes 170 unit tests, 11 site contracts, Astro with 0 errors/0 warnings, the 38-page build, and 26 browser-fixture bundles/47 styles. Focused handler tests include pixel/line/page deltas, repeated reversals, queued event timestamps, subpixel momentum, native-owner boundaries, touch contact lifetime, pinch/zoom and horizontal gestures. Browser fixture compilation is not browser-suite execution.

Hosted V21/V22 checks observed the complete narrow forward/reverse product order, deliberate tab selection, repeated opposite wheel calls 104–109ms apart, one cut during a 1.08-second stream, suppression of a 188ms repeat, acceptance after 332ms quiet, boundary recovery, live Cleveland feed and page wheel over its event rows, native Building controls, menu/form keyboard behavior, accepted hero continuation and original Products slideshow keys. These are controlled desktop browser actions, not physical device tests. V23, source commit `d9596eeb8197397ccadf7419420280d2372ed1fb`, passed the final semantic resize and menu-return retakes on its confirmed `KpN3kooo.js` bundle. Web and Phone remain selected across both breakpoint directions, including Web’s media continuation. Building → Menu → Tab/Down → Escape returns to the same visible Building scene; a normal menu destination still navigates. A held 593px intermediate width settles into clean copy and feed scenes. Older cached HTML and mid-drag transitional captures were explicitly excluded from acceptance.

## Design and accessibility checks

Bounded primary guidance: MDN WheelEvent documentation (https://developer.mozilla.org/en-US/docs/Web/API/WheelEvent) and W3C Pointer Gestures guidance (https://www.w3.org/WAI/WCAG22/Understanding/pointer-gestures.html). Avoid delayed or queued navigation, interpreting tiny momentum jitter as a new intent, stealing native form/app input, and adding visible hints/buttons to explain a controller failure. Existing arrows, keyboard navigation, reduced motion, original content and accepted hero/Story slide behavior remain the intended alternatives and regression baseline.

Wheel events do not expose physical finger contact or momentum phase. The numeric thresholds are bounded engineering heuristics. Unit event-trace replay and supported desktop browser wheel calls do not constitute physical trackpad or touchscreen testing.
