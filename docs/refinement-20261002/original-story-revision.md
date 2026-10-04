# Products: original Story of Dashboard revision

At the owner's request after the initial handoff, Products `#how` now displays the original Story of Dashboard presentation in place of the slide-10 reconstruction. The existing Data Hub explanation, homepage and separate resource viewer are unchanged. The `#how` destination remains valid.

Source: https://environmentaldashboard.org/story-of-dashboard, which publishes Google Slides deck `StoryOfDashboard_200121` (31 slides), published ID `2PACX-1vQfRVKa9JNw8GIXMMFZYf0XpjAwswzrJftYMBl7cBu-cJpzIgNcjBZo1X1jjMBrgofuabYMISCxdDLs`.

The official live deck was inspected on October 2. Its first, second, sixteenth and final frames match the supplied `public/assets/sod/` frames, including their authored explanatory strips. All 31 local 960×720 images remain byte-identical to the uploaded source. Sparse source slides are intentional, not loading placeholders.

The viewer reuses the existing manual Story of Dashboard controller: previous/next and left/right keys, screen-reader position, and the full-size original-image action. It does not add rewritten visible captions, cropped slide content, autoplay, a count strip, or presentation redesign. The official source link is visible. Full images use `object-fit: contain`; quiet 44px controls reveal on content hover/focus and remain visible on touch. A full-size slide can be opened when the original text needs closer reading on a narrow screen.

Bounded design reference review: Impeccable's quality guidance (https://impeccable.style/slop/) and Nielsen Norman Group's aesthetic/minimalist heuristic (https://www.nngroup.com/articles/aesthetic-minimalist-design/) were checked. Avoided patterns: decorative card layers around slides, repeated explanations beside already captioned source frames, competing control bars, and clipping the original lower text strip. No new visual direction was introduced.

Focused regression tests assert the actual Products markup, all 31 frames/navigation/source links, and preservation of the separate Data Hub/resource components. Actual desktop/narrow viewer validation is recorded with the revision handoff; source tests alone do not establish visual fit.

## Accepted revision evidence

Private preview version 20, source commit `e8e6654ea415a1f2894822f0f2181b6dd1090ae9`, contains the final viewer. The build completed at 15:31:53 UTC. All 141 unit tests and 11 source contracts pass; Astro reports no errors or warnings. The actual first, middle and final source frames, keyboard/buttons, endpoint behavior, full-size image and official-source actions were checked. Desktop, short-laptop and 390×606 CSS-pixel narrow views preserve the complete original frame and its caption. The final narrow fit uses the full available346px slide width; 44px controls and the source link remain within the viewport.

The rest of the previously accepted website was not redesigned. The cap-only final adjustment affects only this viewer’s image; V19 interaction checks carry forward. Physical touch hardware and original slide text readability at every possible small screen size are not claimed; the full-size original-image action remains available.
