/** Stable, truthful video previews. Remote posters are optional; the player is a user choice. */
export function enhanceVideoPoster(image: HTMLImageElement): void {
  const stage = image.closest<HTMLElement>('.rs-vid-th');
  const show = (ready: boolean) => {
    image.hidden = !ready;
    stage?.classList.toggle('has-poster', ready);
  };
  image.addEventListener('load', () => show(image.naturalWidth > 0));
  image.addEventListener('error', () => show(false));
  show(image.complete && image.naturalWidth > 0);
}

/** Replace only the preview, never the video title and description beneath it. */
export function mountVideoFrame(box: HTMLElement, frame: HTMLIFrameElement): void {
  if (box.classList.contains('rs-vid')) {
    const preview = box.querySelector<HTMLElement>('.rs-vid-th');
    if (!preview) return;
    const player = box.ownerDocument.createElement('div');
    player.className = 'rs-vid-th is-playing';
    player.appendChild(frame);
    preview.replaceWith(player);
  } else {
    box.replaceChildren(frame);
    box.classList.add('is-playing');
  }
}
