/** The complete original Story of Dashboard frames linked by the official site.
 * These are the supplied, unmodified 960x720 slide images. No rewritten
 * visible captions or reconstructed presentation graphics are added here.
 */
export const STORY_SOURCE = 'https://environmentaldashboard.org/story-of-dashboard';
export const STORY_DECK = 'https://docs.google.com/presentation/d/e/2PACX-1vQfRVKa9JNw8GIXMMFZYf0XpjAwswzrJftYMBl7cBu-cJpzIgNcjBZo1X1jjMBrgofuabYMISCxdDLs';
export function originalStory(id = "how", heading = "Story of Dashboard"): string {
  const data = Array.from({length:31}, (_, i) => ({c:'Original presentation',t:i === 13 ? "How the Dashboard Platform Works" : `Story of Dashboard, original slide ${i + 1}`,d:''}));
  const arrow = (d:string) => `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="${d}"/></svg>`;
  return `<section class="sb original-story" id="${id}" data-original-story data-story-start="13" data-nofit data-stable-start aria-labelledby="${id}-h"><div class="wrap">
    <h2 class="h2" id="${id}-h">${heading}</h2>
    <div class="sb-view" data-sb tabindex="0" role="group" aria-roledescription="slideshow" aria-label="Original Story of Dashboard. Use the left and right arrow keys to change slides.">
      <figure class="sb-slide"><a data-sb-original href="assets/sod/14.jpg" target="_blank" rel="noopener" aria-label="Open original slide full size" title="Open original slide full size"><img data-sb-img src="assets/sod/14.jpg" alt="How the Dashboard Platform Works, original slide 14" width="960" height="720"></a></figure>
      <div class="sr-only" aria-live="polite"><span data-sb-ch></span><span data-sb-t></span><span data-sb-d></span><span data-sb-n>14 of 31</span></div>
      <div class="sb-nav"><button type="button" data-sb-prev aria-label="Previous original slide">${arrow('m15 5-7 7 7 7')}</button><button type="button" data-sb-next aria-label="Next original slide">${arrow('m9 5 7 7-7 7')}</button></div>
    </div>
    <p class="original-story-source"><a href="${STORY_SOURCE}" target="_blank" rel="noopener">Original presentation on Environmental Dashboard</a></p>
    <ol class="sb-strip" hidden aria-hidden="true"></ol>
    <script type="application/json" data-sb-data>${JSON.stringify(data)}</script>
  </div></section>`;
}
