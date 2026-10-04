import voicesSource from "./home-voices-preview.json";
import { nativeScrollable } from "./meeting-embeds";
/** Homepage previews show source content. Full interactive applications live on
 * their product pages; product navigation never belongs to these carousels. */
const esc = (value: string) => value.replaceAll('&','&amp;').replaceAll('"','&quot;').replaceAll('<','&lt;');
export interface Preview {
  image: string;
  context: string;
  alt: string;
  logo?: string;
  readableText?: string;
  quote?: string;
  byline?: string;
  photoBounds?: { x: number; y: number; width: number; height: number };
}

/** Keep source pixels intact; the narrow composition needs only their photo.
 * Explicit clipping matters: viewBox alone leaves its letterbox area drawable. */
function sourcePhoto(example: Preview): string {
  const bounds = example.photoBounds;
  if (!bounds) return '';
  const id = `voice-photo-${example.image.replaceAll('.', '-')}`;
  return `<svg class="preview-mobile-photo"
    viewBox="${bounds.x} ${bounds.y} ${bounds.width} ${bounds.height}"
    role="img" aria-label="${esc(example.alt)}" preserveAspectRatio="xMinYMid meet">
    <defs><clipPath id="${esc(id)}" clipPathUnits="userSpaceOnUse">
      <rect x="${bounds.x}" y="${bounds.y}" width="${bounds.width}" height="${bounds.height}"/>
    </clipPath></defs>
    <image href="assets/${esc(example.image)}" width="960" height="540" clip-path="url(#${esc(id)})"/>
  </svg>`;
}

function previewFigure(example: Preview): string {
  const logo = example.logo
    ? `<img class="preview-logo" src="${esc(example.logo)}" alt="" loading="lazy">` : '';
  const quote = example.quote
    ? `<blockquote class="preview-readable-quote"><p>“${esc(example.quote)}”</p><footer>${esc(example.byline || '')}</footer></blockquote>` : '';
  const text = example.readableText
    ? `<figcaption class="preview-readable-text">${esc(example.readableText)}</figcaption>` : '';
  return `<figure${example.quote ? ' class="source-voice"' : ''}>
    <h4 class="preview-context">${logo}${esc(example.context)}</h4>
    <picture><img src="assets/${esc(example.image)}" alt="${esc(example.alt)}" loading="lazy"></picture>
    ${sourcePhoto(example)}${quote}${text}
  </figure>`;
}

export function previewCarousel(label:string, examples:string[], interval=12000, controls=true):string {
 const arrow=(path:string)=>`<svg viewBox="0 0 24 24" aria-hidden="true"><path d="${path}"/></svg>`;
 return `<div class="home-preview story-player story-player--quiet" data-story data-reading-preview data-reading-idle-resume data-reading-interval="${interval}" role="region" aria-roledescription="carousel" aria-label="${esc(label)}">
 <div class="sp-stage">${examples.map((example,index)=>`<div class="sp-slide" data-sp${index?' hidden':''}>${example}</div>`).join('')}</div>
 ${examples.length>1&&controls?`<div class="sp-bar"><button type="button" class="sp-nav" data-sp-prev aria-label="Previous ${esc(label)} example">${arrow('m15 5-7 7 7 7')}</button><button type="button" class="sp-nav" data-sp-next aria-label="Next ${esc(label)} example">${arrow('m9 5 7 7-7 7')}</button></div>`:''}
 </div>`;
}
export function previewGallery(label: string, examples: Preview[]): string {
  return previewCarousel(label, examples.map(previewFigure));
}

export const buildingPreview=()=>previewCarousel('Building Dashboard',[
 nativeScrollable('https://oberlin.communityhub.cloud/dh-public/ops/dashboard/815','Oberlin College · Harkness',1500),
 nativeScrollable('https://oberlin.communityhub.cloud/dh-public/ops/dashboard/529','Oberlin City Schools · Elementary School',1500),
 nativeScrollable('https://oberlin.communityhub.cloud/dh-public/ops/dashboard/1001','City of Oberlin · Public Library',1500),
],18000,false);
export function passiveEmbed(url: string, title: string, context: string): string {
 return `<figure class="home-live-preview"><h4 class="preview-context">${esc(context)}</h4><div class="home-live-canvas"><iframe data-defer-src="${esc(url)}" data-passive-preview tabindex="-1" aria-hidden="true" title="${esc(title)}" loading="lazy"></iframe></div></figure>`;
}
export const voicesPreview=()=>previewGallery('Community Voices',voicesSource.items.map(item=>({
 image:item.file,context:`${item.community} · ${item.category}`,alt:item.photoAlt,
 quote:item.quote,byline:item.attribution,photoBounds:item.photoBounds,logo:`assets/${item.iconFile}`,
})));

export const storiesPreview=()=>previewGallery('Stories',[
 {image:'source-previews/oberlin-stories-heating-original.png',readableText:'Ongoing conservation efforts remain critical to carbon-neutral goals. Find out how much heating and cooling energy campus buildings are using right now!',context:'Oberlin College · Heating & Cooling',alt:'Original Carbon Neutral Stories illustration and explanation of Oberlin College’s heating and cooling conservation'},
 {image:'source-previews/glsc-stories-climate-original.png',readableText:'The greenhouse effect controls climate',context:'Great Lakes Science Center · Climate',alt:'Original Great Lakes Science Center story explaining how the greenhouse effect controls climate'},
]);

export const dataHubPreview=()=>previewCarousel('Data Hub',[
 passiveEmbed('https://oberlin.communityhub.cloud/dh-public/heat-map/969/chart-window/last-60-days?show-header=1&show-chart-title=1','Oberlin electricity heat map','Oberlin · Electricity heat map'),
 passiveEmbed('https://oberlin.communityhub.cloud/dh-public/time-series-chart/embed/0/chart-window/today?variableId=45660','Oberlin electricity time-series chart','Oberlin · Electricity through the day'),
]);

export const citywidePreview=()=>previewCarousel('Citywide Dashboard',[
 passiveEmbed('https://www.environmentaldashboard.org/cwd-files/dashboard.php?interval=&current_state=','Oberlin Citywide Dashboard','Oberlin · Citywide Dashboard'),
 passiveEmbed('https://cleveland.communityhub.cloud/citywide-dashboard/index?embed=1&show-menu=0','Cleveland Citywide Dashboard','Cleveland · Citywide Dashboard'),
]);
export function calendarPreview(label='Community Calendar',controls=true):string {
 /* controls=false: the two city lists rotate on their own, like the Building Dashboard preview. */
 return previewCarousel(label,['oberlin','cleveland'].map(city=>`<div class="calendar-preview"><h4 class="preview-context">${city==='oberlin'?'Oberlin':'Cleveland'} · Community Calendar</h4><div class="ev-mini calendar-brief" data-events data-city="${city}" data-count="3" data-event-preview><p class="events-fallback" role="status">Loading upcoming events…</p></div></div>`),12000,controls);
}
