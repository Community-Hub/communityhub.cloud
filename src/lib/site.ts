import * as catalog from '../content/catalog';
import copyPolicy from '../content/copy-policy.json';
import imageSizes from '../content/image-sizes.json';
import { responsiveCandidates } from './image-metadata';
import * as helpers from './content-helpers';
import type { PageDefinition, PageOptions, RedirectDefinition } from './types';

const sizes: Readonly<Record<string, readonly number[]>> = imageSizes;

export function addImageSizes(markup: string): string {
  return markup.replace(/<img [^>]*>/g, tag => {
    if (tag.includes(' width=') || tag.includes(' height=')) return tag;
    const source = tag.match(/src="(assets\/[^"]+)"/);
    const size = source && sizes[source[1]];
    return size ? `${tag.slice(0, -1)} width="${size[0]}" height="${size[1]}">` : tag;
  });
}

// The supplied archive contains optimized derivatives. Keep the authoritative
// uploaded fallback in src and derive truthful candidate widths from its metadata.
type Variant = readonly [file: string, width: number];
const RESPONSIVE: Readonly<Record<string, readonly Variant[]>> = {
  'live-contact-workshop.jpg': [['live-contact-workshop-900.jpg', 900], ['live-contact-workshop-1600.jpg', 1600]],
  'live-home-story-01.jpeg': [['live-home-story-01-800.jpeg', 800], ['live-home-story-01-1600.jpeg', 1600]],
  'live-home-story-02.jpeg': [['live-home-story-02-800.jpeg', 800], ['live-home-story-02-1600.jpeg', 1600]],
  'live-home-story-03.png': [['live-home-story-03-640.jpg', 640], ['live-home-story-03-1077.jpg', 1077]],
  'live-home-story-04.jpeg': [['live-home-story-04-800.jpeg', 800], ['live-home-story-04-1600.jpeg', 1600]],
  'live-home-story-06.jpeg': [['live-home-story-06-800.jpeg', 800], ['live-home-story-06-1600.jpeg', 1600]],
  'live-home-story-07.jpeg': [['live-home-story-07-800.jpeg', 800], ['live-home-story-07-1600.jpeg', 1600]],
  'live-team-01.jpg': [['live-team-01-480.jpg', 422]],
  'live-team-02.jpg': [['live-team-02-480.jpg', 422]],
  'live-team-03.jpg': [['live-team-03-480.jpg', 421]],
  'live-team-04.jpg': [['live-team-04-480.jpg', 418]],
  'live-team-05.jpg': [['live-team-05-480.jpg', 422]],
  'live-team-06.jpg': [['live-team-06-480.jpg', 422]],
};
// Icons are drawn at 28-44px from 220-281px files; every one has a 96px copy (-96.png).
const ICON = /^(icon-[a-z-]+|story-ic-[a-z]+|story-watertreatment)\.png$/;

function responsiveSizes(tag: string, file: string, slug: string): string {
  if (file.startsWith('live-team-')) return '200px';
  // Measured: the ending photo is 720px wide up to 900px viewports, 452-580px above, hidden on phones.
  if (tag.includes('ending-photo')) return '(max-width: 900px) 720px, 600px';
  if (file.startsWith('live-contact-workshop')) return `(max-width: 760px) 92vw, ${slug === 'contact' ? 1000 : 720}px`;
  return '(max-width: 760px) 92vw, 800px';
}

export function addResponsiveImages(markup: string, slug: string): string {
  return markup.replace(/<img [^>]*>/g, tag => {
    if (tag.includes(' srcset=')) return tag;
    const source = tag.match(/ src="assets\/([^"?]+)"/);
    if (!source) return tag;
    const file = source[1];
    const variants = RESPONSIVE[file] ? responsiveCandidates(RESPONSIVE[file], sizes) : [];
    if (variants.length) {
      const srcset = variants.map(([name, width]) => `assets/${name} ${width}w`).join(', ');
      return `${tag.slice(0, -1)} srcset="${srcset}" sizes="${responsiveSizes(tag, file, slug)}">`;
    }
    const icon = file.match(ICON);
    if (icon) {
      const shown = Number(tag.match(/ width="(\d+)"/)?.[1] ?? 44);
      return `${tag.slice(0, -1)} srcset="assets/${icon[1]}-96.png 96w" sizes="${Math.min(shown, 44)}px">`;
    }
    return tag;
  });
}

// The first sizeable image of the opening scene is the likely largest paint: load it now
// and at high priority. Everything further down the page keeps loading lazily.
const OPENING_SKIP = /^(icon-|ro-|story-ic|story-watertreatment|mascot|gauge-|cal-cat|cwd-scene)/;
export function prioritizeOpeningImage(markup: string): string {
  const first = markup.indexOf('<section');
  if (first < 0) return markup;
  const second = markup.indexOf('<section', first + 8);
  const end = second < 0 ? markup.length : second;
  const scene = markup.slice(first, end);
  const tags = scene.match(/<img [^>]*>/g) ?? [];
  const pick = tags.find(tag => {
    const file = tag.match(/ src="assets\/([^"?]+)"/)?.[1];
    if (!file || OPENING_SKIP.test(file) || tag.includes('ending-photo') || tag.includes('fetchpriority=')) return false;
    const width = Number(tag.match(/ width="(\d+)"/)?.[1] ?? sizes[`assets/${file}`]?.[0] ?? 0);
    return width === 0 || width >= 480;
  });
  if (!pick) return markup;
  const eager = `${pick.replace(' loading="lazy"', '').slice(0, -1)} loading="eager" fetchpriority="high">`;
  return markup.slice(0, first) + scene.replace(pick, eager) + markup.slice(end);
}

export function nextSteps(slug: string): string {
  const picks = catalog.NEXT_FOR[slug] || ['data-dashboard', 'dashboards', 'products', 'pricing'].filter(s => s !== slug).slice(0, 3);
  const actions = picks.filter(s => s in catalog.NEXT).map(s => {
    const [href, , title, description] = catalog.NEXT[s];
    return `<li><a class="ending-link" href="${href}"><strong>${title}</strong><span>${description}</span></a></li>`;
  }).join('');
  return `<nav class="ending-links" aria-label="Keep exploring"><h3 class="ending-links-h">Keep exploring</h3><ul class="ending-actions">${actions}</ul></nav>`;
}

const CONTACT_ENDINGS = new Set(['pricing']);
function consolidateEnding(body: string, slug: string): string {
  const cta = /<section class="cta-band"[^>]*>([\s\S]*?)<\/section>/;
  const match = cta.exec(body);
  if (!match) return body;

  // The case-study handoff is part of the final action, not a screen on its own.
  // Match only the known single-link wrapper so ordinary sections stay intact.
  const before = body.slice(0, match.index);
  const story = /<section class="sec-pad" style="padding-top:0"><div class="wrap">(<a class="ppl-next"[\s\S]*?<\/a>)<\/div><\/section>\s*$/;
  const storyMatch = story.exec(before);
  let prefix = storyMatch ? before.slice(0, storyMatch.index) : before;
  const cross = /<p class="ppl-cross">[\s\S]*?<\/p>\s*$/;
  const crossMatch = cross.exec(prefix);
  const crossLink = crossMatch ? crossMatch[0] : '';
  if (crossMatch) prefix = prefix.slice(0, crossMatch.index);
  const storyLink = storyMatch
    ? `<nav class="ending-story" aria-label="Next case study">${storyMatch[1]}</nav>`
    : '';
  const headingId = `ending-title-${slug}`;
  const ctaContent = match[1].replace(/^<div class="wrap">([\s\S]*)<\/div>$/, '$1')
    .replace('<h2>', `<h2 id="${headingId}">`);
  // A contact heading needs contact content: the invitation, the booking button and the team's email.
  const isContact = ctaContent.includes('>Contact Us</h2>');
  // "Book a demo" already sits in the header of every page, so the full Contact Us
  // invitation closes only pricing; the contact page carries it in full.
  if (isContact && !CONTACT_ENDINGS.has(slug)) {
    const ending = `<section class="cta-band page-ending page-ending-explore" aria-labelledby="${headingId}"><div class="wrap page-ending-layout"><div class="ending-action">${crossLink}<div class="ending-options">${storyLink}${nextSteps(slug).replace('<h3 class="ending-links-h">', `<h3 class="ending-links-h" id="${headingId}">`)}</div></div><img class="ending-photo" src="assets/live-contact-workshop.jpg" alt="Participants in an Environmental Dashboard workshop at the Great Lakes Science Center" loading="lazy"></div></section>`;
    return prefix + ending + body.slice(match.index + match[0].length);
  }
  const contactContent = isContact
    ? ctaContent.replace('Contact Us</h2></div>', `Contact Us</h2><p>${helpers.CONTACT_TEXT}</p></div>`) +
      '<p class="ending-mail">Or email <a href="mailto:connect@communityhub.cloud">connect@communityhub.cloud</a></p>'
    : ctaContent;
  const ending = `<section class="cta-band page-ending" aria-labelledby="${headingId}"><div class="wrap page-ending-layout"><div class="ending-action"><div class="ending-cta">${contactContent}</div>${crossLink}<div class="ending-options">${storyLink}${nextSteps(slug)}</div></div><img class="ending-photo" src="assets/live-contact-workshop.jpg" alt="Participants in an Environmental Dashboard workshop at the Great Lakes Science Center" loading="lazy"></div></section>`;
  return prefix + ending + body.slice(match.index + match[0].length);
}


export class CopyError extends Error {}
export function checkCopy(text: string, where: string): void {
  // Exact author wording takes precedence over the guard for new marketing copy.
  // Native Notion source: Build Out CH Promo Website, lines 1042 and 1066.
  let candidate = text;
  for (const paragraph of copyPolicy.originalParagraphs) {
    candidate = candidate.replaceAll(JSON.stringify(paragraph).slice(1, -1), '');
    candidate = candidate.replaceAll(paragraph, '');
  }
  for (const term of [...copyPolicy.dashes, ...copyPolicy.phrases]) {
    if (candidate.toLowerCase().includes(term)) throw new CopyError(`Disallowed copy ${JSON.stringify(term)} in ${where}`);
  }
}

/** Lift each section title (after the opening) into a full-width band under the header,
 *  as the homepage does for To engage / To educate / To motivate. */
function titleBands(body: string): string {
  const open = /<section\b([^>]*)>/g;
  let out = '';
  let last = 0;
  let index = 0;
  for (let m = open.exec(body); m; m = open.exec(body)) {
    const start = m.index + m[0].length;
    if (/class="[^"]*\b(?:cta-band|page-ending)\b/.test(m[1])) continue;
    if (index++ === 0) {
      // The page title gets the same green band as every section title.
      const h1 = /<h1\b[^>]*>[\s\S]*?<\/h1>/.exec(body.slice(start));
      const close = body.indexOf('</section>', start);
      if (!h1 || (close >= 0 && start + h1.index > close)) continue;
      const at = start + h1.index;
      out += body.slice(last, start) + `<div class="sec-band sec-band-h1"><div class="wrap">${h1[0].replace(/ style="[^"]*"/, '')}</div></div>` + body.slice(start, at);
      last = at + h1[0].length;
      continue;
    }
    const nextOpen = body.indexOf('<section', start);
    const nextClose = body.indexOf('</section>', start);
    const end = Math.min(nextOpen < 0 ? Infinity : nextOpen, nextClose < 0 ? Infinity : nextClose);
    const h2 = /<h2\b[^>]*>[\s\S]*?<\/h2>/.exec(body.slice(start, end));
    if (!h2) continue;
    const at = start + h2.index;
    const title = h2[0].replace(/ style="[^"]*"/, '');
    // The band names the section, so a leading eyebrow label would repeat it.
    const rest = body.slice(at + h2[0].length, end);
    const fig = /<p class="fig">[^<]*<\/p>/.exec(body.slice(start, end));
    const lead = fig && !/<(?:h3|img|figure|li)\b/.test(body.slice(start, start + fig.index)) ? fig : null;
    const strip = (from: number, to: number) => {
      const chunk = body.slice(from, to);
      return lead ? chunk.replace(lead[0], '') : chunk;
    };
    out += body.slice(last, start) + `<div class="sec-band"><div class="wrap">${title}</div></div>` + strip(start, at);
    if (lead && body.slice(start, at).includes(lead[0])) {
      last = at + h2[0].length;
    } else {
      out += lead ? rest.replace(lead[0], '') : rest;
      last = end;
    }
  }
  return out + body.slice(last);
}

function page(slug: string, title: string, description: string, input: string, options: PageOptions = {}): PageDefinition {
  let body = input;
  let contents = '';
  if (slug !== 'index') {
    // Chapter and case links belong to one on-demand header menu.
    body = body.replace(/<nav class="(?:zpa-jump|zpb-jump|ppl-jump)"[^>]*><div class="wrap">([\s\S]*?)<\/div><\/nav>/g,
      (_whole, links: string) => { contents += `<nav aria-label="On this page">${links}</nav>`; return ''; });
    body = body.replace(/<nav class="cs-switch"[^>]*>([\s\S]*?)<\/nav>/g,
      (_whole, links: string) => { contents += `<nav aria-label="Case studies">${links}</nav>`; return ''; });
  }
  // Interior navigation lands on useful content. Keep its compact title and the
  // first content block in one semantic story section, after any sticky jump bar.
  if (slug !== 'index') {
    body = body.replace(/^(<header class="page-intro">[\s\S]*?<\/header>)([\s\S]*?)(<section\b[^>]*>)/,
      (_whole, intro: string, between: string, section: string) => `${between}${section}${intro}`);
  }

  if (slug !== 'index') body = consolidateEnding(body, slug);
  if (slug !== 'index') body = titleBands(body);
  if (slug !== 'index') {
    body = body.replace(/<h1([^>]*)>([\s\S]*?)<\/h1>/, (whole: string, attrs: string, text: string) => {
      const length = text.replace(/<[^>]+>/g, '').length;
      const cls = length > 58 ? 'h1-long' : length > 32 ? 'h1-mid' : '';
      if (!cls) return whole;
      const attributes = attrs.includes('class="') ? attrs.replace('class="', `class="${cls} `) : `${attrs} class="${cls}"`;
      return `<h1${attributes}>${text}</h1>`;
    });
  }
  const definition: PageDefinition = {
    slug, title, description, contents, body: addImageSizes(prioritizeOpeningImage(addResponsiveImages(body, slug))), current: options.current || slug,
    fullTitle: options.full_title || `${title} | Community Hub`,
    canonical: `${helpers.BASE_URL}${slug === 'index' ? '' : `${slug}.html`}`,
    jsonld: options.jsonld,
    pager: slug !== 'index' && body.includes('<section') && !body.includes('class="hv'),
  };
  checkCopy(JSON.stringify(definition), `page ${slug}`);
  return definition;
}

export const redirects: readonly RedirectDefinition[] = [
  { slug: 'data-hub', to: 'the-hub.html', title: 'Data Hub' },
  { slug: 'building-dashboard', to: 'data-dashboard.html#building', title: 'Building Dashboard' },
  { slug: 'citywide-dashboard', to: 'data-dashboard.html#citywide', title: 'Citywide Dashboard' },
];

export function createSite() {
  const pages = new Map<string, PageDefinition>();
  const write_page = (slug: string, definition: PageDefinition): void => {
    if (slug !== definition.slug) throw new Error(`Route ${slug} does not match ${definition.slug}`);
    if (pages.has(slug)) throw new Error(`Duplicate route ${slug}`);
    pages.set(slug, definition);
  };
  return { ...catalog, ...helpers, page, write_page, pages, json: { dumps: JSON.stringify }, html: { escape: helpers.e }, check_copy: checkCopy, CopyError };
}
export type SiteContext = ReturnType<typeof createSite>;
