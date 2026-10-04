/** Shared typed content renderers. Astro owns the document, header, and footer. */
import {
  PBY,
  TESTIMONIALS,
  CV_SLIDES,
  CV_COLOR,
  ORG_SITES,
  DATA_VIEWS,
} from "../content/catalog";
import type { Product, Testimonial, Pair, Triple, Breadcrumb } from "./types";

export const BASE_URL = "https://www.communityhub.cloud/";
export const OG_BASE = BASE_URL;
export const ASSET_V = "ts-1";
export const ARR = "";

/** Match Python html.escape so quotes remain safe in text and attributes. */
export function e(value: string, quote = true): string {
  let escaped = value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");
  if (quote)
    escaped = escaped.replaceAll('"', "&quot;").replaceAll("'", "&#x27;");
  return escaped;
}

export function picon(p: Pick<Product, "icon">, cls: string = "mi"): string {
  return `<img class="${cls}" src="assets/${p["icon"]}" alt="" width="36" height="36" loading="lazy">`;
}
export const CONTACT_TEXT = "We welcome inquiries about our software applications and pricing options for organizations and whole communities.";
export function cta_band(
  title: string = "Contact Us",
  text: string = CONTACT_TEXT,
): string {
  return `<section class="cta-band" aria-label="Contact"><div class="wrap"><div><h2>${title}</h2>${text ? `<p>${text}</p>` : ""}</div><a class="btn-ink" href="contact.html">Book a demo</a></div></section>`;
}
export function quote(
  q: string,
  who: string,
  role: string,
  cls: string = "",
  scene?: { img: string; alt: string; cap: string },
): string {
  const source = TESTIMONIALS.find(item => item.who === who && item.quote === q);
  const photo = cls.includes("quote-text-only") ? "" : source
    ? `<img class="pull-source-photo" src="assets/${source.img}" alt="${e(source.alt)}" loading="lazy">`
    : scene
      ? `<figure class="pull-source-photo pull-scene"><img src="assets/${scene.img}" alt="${e(scene.alt)}" loading="lazy"><figcaption>${e(scene.cap)}</figcaption></figure>`
      : "";
  return `<blockquote class="pull ${cls}${photo ? " has-source-photo" : ""}" data-story-scene>${photo}<p>&ldquo;${e(q)}&rdquo;</p><footer>${e(who)}${role ? `, ${e(role)}` : ""}</footer></blockquote>`;
}
export function feat_list(items: readonly Pair[], cols: number = 2): string {
  const cls = cols === 2 ? "c2" : "";
  return (
    `<div class="feat-list ${cls}">` +
    items.map(([t, d]) => `<div><h3>${t}</h3><p>${d}</p></div>`).join("") +
    "</div>"
  );
}
export function stanza_row(items: readonly Triple[], cols: number = 3): string {
  const cls = cols === 3 ? "c3" : "c2";
  let out = `<div class="stanza-row ${cls}">`;
  for (const [c, t, d] of items) {
    out += `<div class="stanza" style="background:${c}"><h3>${t}</h3><p>${d}</p></div>`;
  }
  out += "</div>";
  return out;
}
export function postcard(
  img: string,
  alt: string,
  cap: string | null = null,
  rot: number = -2,
): string {
  const c = cap ? `<span class="postcard-cap">${e(cap)}</span>` : "";
  return `<figure class="postcard" style="--r:${rot}deg"><img src="assets/${img}" alt="${e(alt)}" loading="lazy">${c}</figure>`;
}
export function picon_big(p: Pick<Product, "icon">, size: number = 40): string {
  return `<img src="assets/${p["icon"]}" alt="" width="${size}" height="${size}" loading="lazy">`;
}
export function product_link_row(slugs: readonly string[]): string {
  return (
    '<ul class="wwith">' +
    slugs
      .map((s) => `<li><a href="${s}.html">${PBY[s]["name"]}</a></li>`)
      .join("") +
    "</ul>"
  );
}
export function now_strip(
  id_: string = "now",
  go: Pair = ["dashboards.html", "Open the live dashboards"] as const,
): string {
  return `<div class="now" data-now id="${id_}" role="region" aria-labelledby="now-h">
  <div class="now-l"><p class="now-h" id="now-h">Oberlin now</p><p class="now-time" data-now-time>Reading the meters</p></div>
  <div class="now-flash"><p class="now-say" data-now-say aria-live="polite">Counting Oberlin's kilowatts.</p>
    <span class="ring" data-mood="neutral"><img data-flash-face src="assets/mascot-neutral-clean.gif" alt="Flash the energy squirrel" width="80" height="80"></span>
    <span class="mood-word" data-mood-word>Calm</span></div>
  <ul class="now-cells" data-now-cells>
    <li class="cell" data-g="1021"><img class="cell-ic" src="assets/icon-electricity.png" alt=""><span class="cell-t"><span class="cell-l">Whole city electricity</span><span class="cell-v"><b data-num>&nbsp;</b><small>kW</small></span><span class="cell-bar" aria-hidden="true"><i></i></span></span></li>
    <li class="cell" data-g="1019"><img class="cell-ic" src="assets/icon-campuses.png" alt=""><span class="cell-t"><span class="cell-l">Oberlin College</span><span class="cell-v"><b data-num>&nbsp;</b><small>W per student</small></span><span class="cell-bar" aria-hidden="true"><i></i></span></span></li>
    <li class="cell" data-g="1033"><img class="cell-ic" src="assets/icon-environment.png" alt=""><span class="cell-t"><span class="cell-l">Air temperature</span><span class="cell-v"><b data-num>&nbsp;</b><small>&deg;F</small></span><span class="cell-bar" aria-hidden="true"><i></i></span></span></li>
    <li class="cell" data-g="1030"><img class="cell-ic" src="assets/icon-air.png" alt=""><span class="cell-t"><span class="cell-l">Air quality</span><span class="cell-v"><b data-num>&nbsp;</b><small>AQI</small></span><span class="cell-bar" aria-hidden="true"><i></i></span></span></li>
  </ul>
  <a class="now-go" href="${go[0]}"><span>${go[1]}</span></a>
</div>`;
}
/** The native public Citywide app owns its data, filters and controls. */
export function cwd_sign(_with_whatif: boolean = true): string {
  return live_frame(
    "https://www.environmentaldashboard.org/cwd?show-menu-bar=1",
    "Oberlin Citywide Dashboard",
    "environmentaldashboard.org",
    620,
    "",
    "",
    "https://www.environmentaldashboard.org/cwd-files/dashboard.php?interval=&current_state=",
  );
}
export function events_block(
  title: string = "Happening in Oberlin this week",
  intro: string = "Pulled live from the same community calendar that feeds Oberlin's screens and weekly email.",
  n: number = 6,
): string {
  return `<div class="sec-head"><p class="fig">Community Calendar</p><h2 class="h2">${title}</h2><p class="lede" style="margin-top:10px">${intro}</p></div>
<div data-events data-count="${n}" style="margin-top:24px"><p class="events-fallback">Loading upcoming events.</p></div>`;
}
export function testimonial_slider(
  items: readonly Testimonial[] | null = null,
): string {
  items = items?.length ? items : TESTIMONIALS;
  let slides = "";
  for (const [i, t] of items.entries()) {
    const hid = i === 0 ? "" : " hidden";
    slides += `<article class="slide" data-slide${hid} aria-roledescription="slide" aria-label="${i + 1} of ${items.length}" style="--c:${t["c"]};--ink-on:${t["ink"]}">
  <figure class="slide-pic"><img src="assets/${t["img"]}" alt="${e(t["alt"])}" style="object-position:${t["pos"]}" loading="lazy"></figure>
  <div class="slide-say"><blockquote class="say-bub"><p>&ldquo;${e(t["quote"])}&rdquo;</p></blockquote>
    <p class="slide-who"><b>${e(t["who"])}</b><span>${e(t["role"])}</span></p>
    <a class="slide-go" href="${t["link"]}"><img src="assets/${t["link_icon"]}" alt="">${e(t["link_label"])}</a></div>
</article>`;
  }
  return `<div class="words-head"><h2 class="h2" id="words-h">People who use it, in their own words</h2>
  <div class="words-ctrl"><button type="button" class="rbtn" data-sl-prev aria-label="Previous quote"><svg viewBox="0 0 24 24"><path d="M19 12H6M11 6l-6 6 6 6"/></svg></button>
  <button type="button" class="rbtn" data-sl-next aria-label="Next quote"><svg viewBox="0 0 24 24"><path d="M5 12h13M13 6l6 6-6 6"/></svg></button></div></div>
<div class="slider" data-slider role="region" aria-roledescription="carousel" aria-label="Quotes about Community Hub">
  <div class="slides" aria-live="off">${slides}</div>
  <div class="sl-foot"><div class="sl-dots" data-sl-dots aria-label="Choose a quote"></div><p class="sl-count" aria-hidden="true"><b data-sl-n>1</b> / ${items.length}</p></div>
</div>`;
}
export function voices_sign_mode(): string {
  const cards = CV_SLIDES.map(
    ([img, alt, q, who, role, c, cat], i) =>
      `<div class="cv${i === 0 ? " is-on" : ""}"><img src="assets/${img}" alt="${e(alt)}" loading="lazy"><div class="q"><p>&ldquo;${e(q)}&rdquo;</p><footer class="cv-author">${e(who)}${role ? `, ${e(role)}` : ""}</footer></div><p class="cat" style="border-color:${CV_COLOR[c]}">${cat}</p></div>`,
  ).join("");
  return `<div class="voices-sign" data-voices-sign aria-label="Community Voices, shown the way it runs on a sign">${cards}</div>`;
}
export function live_frame(
  url: string,
  title: string,
  host: string,
  height: number = 520,
  note: string = "",
  preview: string = "",
  embed_url: string = url,
): string {
  const openLabel = /calendar/i.test(title) ? "Open calendar" : "Open dashboard";
  const cap = note ? `<figcaption${preview ? ' data-embed-preview-status aria-live="polite"' : ""}>${note}</figcaption>` : "";
  const still = preview ? `<img class="embed-preview-image" src="assets/${preview}" alt="Original still image of a Building Dashboard" loading="lazy">` : "";
  return `<figure class="live-frame" data-src="${embed_url}" data-title="${e(title)}" style="--h:${height}px"><div class="bar"><span>${host}</span>${org_link(url) || `<a href="${url}" target="_blank" rel="noopener noreferrer" aria-label="Open ${e(title)}">${openLabel} ${ARR}</a>`}${org_link(url) ? `<a href="${url}" target="_blank" rel="noopener noreferrer">${openLabel} ${ARR}</a>` : ""}<button type="button" class="lf-load">Retry loading ${e(title)}</button></div><div class="lf-body"${preview ? ' data-embed-preview data-preview-active' : ""}>${still}${preview ? "" : `<p class="lf-wait" role="status">Loading ${e(title)}…</p>`}</div>${cap}</figure>`;
}
export function story_player(
  slides: readonly Pair[],
  cap_title: string,
  base: string = "deck/",
  _text_controls: boolean = false,
): string {
  const sl = slides
    .map(
      ([img, c], i) =>
        `<figure class="sp-slide"${i === 0 ? "" : " hidden"} data-sp><img src="assets/${base}${img}" alt="${e(c)}" loading="lazy"><figcaption class="sp-cap">${e(c)}</figcaption></figure>`,
    )
    .join("");
  const dots = Array.from(
    { length: slides.length - 0 },
    (_, index) => index + 0,
  )
    .map(
      (i) =>
        `<button type="button" aria-current="${i === 0 ? "true" : "false"}" aria-label="Slide ${i + 1}"></button>`,
    )
    .join("");
  return `<div class="story-player story-player--quiet" data-story aria-label="${e(cap_title)}">
  <div class="sp-stage">${sl}</div>
  <div class="sp-bar"><button type="button" class="sp-nav" data-sp-prev aria-label="Previous slide"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="m15 5-7 7 7 7"/></svg></button><div class="sp-dots" data-sp-dots>${dots}</div><span class="sp-count" data-sp-count>1 / ${slides.length}</span><button type="button" class="sp-nav" data-sp-next aria-label="Next slide"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="m9 5 7 7-7 7"/></svg></button><button type="button" class="sp-nav sp-pause" data-sp-pause aria-pressed="false" aria-label="Pause slides"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8 5v14M16 5v14"/></svg></button></div>
</div>`;
}
export function sw_ld(p: Product): Record<string, unknown> {
  return {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: p["name"],
    applicationCategory: "BusinessApplication",
    operatingSystem: "Web",
    description: p["desc"],
    provider: { "@type": "Organization", name: "Community Hub", url: BASE_URL },
  };
}

export function crumbs(...parts: readonly Breadcrumb[]): string {
  const out = ['<a href="index.html">Home</a>'];
  for (const [href, label] of parts) {
    out.push('<span aria-hidden="true">/</span>');
    out.push(href ? `<a href="${href}">${label}</a>` : `<span>${label}</span>`);
  }
  return (
    '<nav class="crumbs" aria-label="Breadcrumb">' + out.join("") + "</nav>"
  );
}

export function hero(
  crumb_html: string,
  label: string,
  h1: string,
  lede: string,
  media_html: string,
  ctas: string | null = null,
): string {
  const actions = ctas || "";
  return `<header class="page-intro"><div class="wrap page-intro-grid"><div>${crumb_html}<p class="fig">${label}</p><h1 class="h1">${h1}</h1><p class="lede">${lede}</p>${actions ? `<div class="page-intro-actions">${actions}</div>` : ""}</div>${media_html ? `<div class="page-intro-media">${media_html}</div>` : ""}</div></header>`;
}

export function voices_wall(link = true): string {
  const cards = CV_SLIDES.map(
    ([img, alt, q, who, role, c, cat]) =>
      `<article class="cv"><div class="ph"><img src="assets/${img}" alt="${e(alt)}" loading="lazy"></div><div class="q"><p>&ldquo;${e(q)}&rdquo;</p><div class="who"><b>${e(who)}</b>, ${e(role)}</div><p class="cat" style="color:${CV_COLOR[c]}">${cat}</p></div></article>`,
  ).join("");
  const more = link
    ? '<p style="margin-top:18px"><a class="hand-link" href="community-voices.html"><svg class="hand-arrow" viewBox="0 0 70 44" aria-hidden="true"><path d="M4 8 C 18 34, 40 38, 62 26"/></svg>How Community Voices works</a></p>'
    : "";
  const seen = new Set<string>();
  const legend: string[] = [];
  for (const [, , , , , color, category] of CV_SLIDES) {
    if (!seen.has(category)) {
      seen.add(category);
      legend.push(
        `<span><i style="background:${CV_COLOR[color]}"></i>${category}</span>`,
      );
    }
  }
  return `<div class="voices-wall" data-reveal-group>${cards}</div><div class="legend">${legend.join("")}</div>${more}`;
}

/** Prefer a verified matching partner page above an embedded dashboard. */
export function org_link(url: string, class_name = "lf-org"): string {
  for (const [prefix, label, href] of ORG_SITES) {
    if (url.startsWith(prefix)) {
      return `<a class="${class_name}" href="${href}" target="_blank" rel="noopener noreferrer" aria-label="Visit ${e(label)}">Visit partner page ${ARR}</a>`;
    }
  }
  return "";
}

/** Manual tabs preserve the real chart URLs and authored source disclosures. */
export function data_views(label = "Live views of Oberlin's data", keys?: readonly string[]): string {
  let tabs = "";
  let views = "";
  for (const [i, v] of DATA_VIEWS.filter(view => !keys || keys.includes(view.key)).entries()) {
    const on = i === 0;
    tabs += `<button type="button" role="tab" id="dvt-${v.key}" aria-controls="dvp-${v.key}" aria-selected="${on ? "true" : "false"}" tabindex="${on ? 0 : -1}">${v.tab}</button>`;
    const body =
      v.src !== undefined
        ? `<div class="dv-chart" data-dv-${v.key}="${v.src}"><p class="dv-wait">Loading live data</p></div>`
        : `<div class="mini" data-mini style="--w:1280;--h:800;background-image:url(assets/${v.shot})"><iframe data-defer-src="${v.live}" title="${e(v.title)}" loading="lazy" width="1280" height="800" tabindex="-1"></iframe></div>`;
    views += `<div class="dv-view${on ? " is-on" : ""}" ${keys?.length === 1 ? `role="region" aria-label="${e(v.title)}"` : `role="tabpanel" aria-labelledby="dvt-${v.key}"`} id="dvp-${v.key}">${org_link(v.live, "dv-source")}<div class="dv-frame">${body}</div><div class="dv-note" id="dv-note-${v.key}" hidden><p><b>${v.tab}</b>${e(v.note)}</p></div><p class="dv-cap">Live: ${e(v.title)}. <a href="${v.live}" target="_blank" rel="noopener">Open the live chart ${ARR}</a> <button type="button" class="dv-help" data-dv-help aria-expanded="false" aria-controls="dv-note-${v.key}">What does this show?</button></p></div>`;
  }
  return `<div class="dv" data-dv aria-label="${e(label)}">${keys?.length === 1 ? "" : `<div class="dv-tabs" role="tablist" aria-label="${e(label)}">${tabs}</div>`}<div class="dv-stage">${views}</div></div>`;
}
