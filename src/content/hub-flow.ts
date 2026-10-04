/** A native web reconstruction of the supplied presentation's slide 10.
 * The XML has four click groups: building → its apps; environmental → Citywide;
 * social → Calendar/Voices; then web, phone and signage. Eight narration stops
 * retain that source order while allowing readable web pacing and navigation.
 * The diagram's source-specific Building Dashboard name is retained; the
 * surrounding product directory continues to use the approved Data Dashboard name.
 */
const STEPS = [
  'Building performance data starts the process.',
  'The Hub collects and processes building performance data.',
  'Building Dashboard and Hub Analytics turn building data into useful visualizations.',
  'Environmental and municipal data also enters the Hub.',
  'Citywide Dashboard communicates community resource flows and environmental conditions.',
  'Social data and storytelling bring community activity into the Hub.',
  'Calendar and Jobs Board and Community Voices share that community activity.',
  'Interactive Signage, Web Embeddables and the Phone App bring these applications to people.',
] as const;
const ASSET='assets/platform-explanation/';
const img=(file:string,alt='',className='')=>`<img class="${className}" src="${ASSET}${file}" alt="${alt}" decoding="async">`;
const SOURCES=[
  ['building-sources.png','Building Performance data','building',1],
  ['environmental-sources.png','Environmental &amp; Municipal Data','environment',4],
  ['social-sources.png','Social Data &amp; Storytelling','social',6],
] as const;
const APPS=[
  ['building-dashboard.png','Building Dashboard','building-dashboard.html',3,'building'],
  ['analytics-lens.png','Hub Analytics','the-hub.html',3,'analytics'],
  ['citywide-dashboard.png','Citywide Dashboard','citywide-dashboard.html',5,'citywide'],
  ['calendar-jobs.png','Calendar &amp; Jobs Board','community-calendar.html',7,'calendar'],
  ['community-voices.png','Community Voices','community-voices.html',7,'voices'],
] as const;
const controls='<div class="hf-controls" data-hf-controls hidden><button type="button" class="hf-nav-button" data-hf-back aria-label="Previous explanation step" title="Previous explanation step"><svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="m15 5-7 7 7 7"/></svg></button><button type="button" class="hf-nav-button" data-hf-next aria-label="Next explanation step" title="Next explanation step"><svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="m9 5 7 7-7 7"/></svg></button></div>';

export function hub_flow(id:string,heading:string,headingTag:'h1'|'h2'='h2'):string {
  return `<section class="hub-flow hub-flow--source" id="${id}" data-nofit aria-labelledby="${id}-h"><div class="wrap">
    <${headingTag} class="h2" id="${id}-h">${heading}</${headingTag}>
    <div class="hf" data-hub-flow data-hf-model="slide-10" data-step="8">
      <div class="hf-grid hf-source-model" data-scroll-owner tabindex="0" role="region" aria-label="Slide 10 platform explanation; scroll to explore its data, applications and public formats">
        <svg class="hf-source-connections" viewBox="0 0 1000 390" preserveAspectRatio="none" aria-hidden="true">
          <path class="hf-source-link hf-building-link" data-hf-step="1" data-hf-until="3" d="M223 67Q276 70 328 149"/>
          <path class="hf-source-link hf-building-link" data-hf-step="3" data-hf-until="3" d="M478 142Q513 69 555 52"/>
          <path class="hf-source-link hf-environment-link" data-hf-step="4" data-hf-until="5" d="M224 195H306"/>
          <path class="hf-source-link hf-environment-link" data-hf-step="5" data-hf-until="5" d="M493 187Q525 122 555 113"/>
          <path class="hf-source-link hf-social-link" data-hf-step="6" data-hf-until="7" d="M223 320Q280 309 326 251"/>
          <path class="hf-source-link hf-social-link" data-hf-step="7" data-hf-until="7" d="M486 237Q527 184 555 175"/>
        </svg>
        <div class="hf-sources hf-source-inputs" data-hf-step="0"><h3>Data sources:</h3>
          <ul>${SOURCES.map(([asset,label,key,step])=>`<li class="hf-source-input hf-source-input--${key}" data-hf-step="0" data-hf-focus="${step}"><span class="hf-input-art" aria-hidden="true">${img(asset)}</span><span class="hf-source-label" data-hf-step="${step}">${label}</span></li>`).join('')}</ul>
        </div>
        <div class="hf-source-hub" data-hf-step="0" data-hf-focus="2">
          ${img('hub-collects.png','','hf-collect-ring')}${img('hub-hands.png','','hf-collect-hands')}
          <svg class="hf-processing" data-hf-processing viewBox="0 0 200 200" aria-hidden="true"><circle cx="100" cy="100" r="92"/></svg>
          <strong>The<br>Hub</strong><span class="hf-hub-description">collects data to create visualization apps</span>
        </div>
        <div class="hf-apps hf-source-apps" data-hf-step="2"><h3>Data visualization apps:</h3>
          <ul>${APPS.map(([asset,label,href,step,key])=>`<li class="hf-source-app hf-source-app--${key}" data-hf-step="${step}"${key==='analytics'||key==='voices'?'':` data-hf-focus="${step}"`}><a href="${href}"><span class="hf-app-symbol">${key==='analytics'?img('analytics-heatmap.png','','hf-analytics-map'):''}${img(asset)}</span><b>${label}</b></a></li>`).join('')}</ul>
        </div>
        <div class="hf-venues hf-source-venues" data-hf-step="8" data-hf-focus="8"><h3>For engaging people!</h3>
          <a class="hf-venue hf-venue--web" href="web-embeddables.html">${img('web-embeddables.jpg','A student using a dashboard on a laptop')}<b>Web Embeddables</b></a>
          <a class="hf-venue hf-venue--phone" href="phone-app.html"><img src="assets/phone-workflow/oberlin-hub-menu.png" alt="The actual Oberlin Hub phone menu" decoding="async"><b>Phone App</b></a>
          <a class="hf-venue hf-venue--signage" href="digital-signage.html">${img('interactive-signage.png','Community Hub dashboards displayed on a wall-mounted screen')}<b>Interactive Signage</b></a>
        </div>
      </div>
      <div class="hf-source-footer"><p class="hf-say" aria-live="polite" data-hf-say>${STEPS[7]}</p>${controls}</div>
      <script type="application/json" data-hf-steps>${JSON.stringify(STEPS)}</script>
    </div>
  </div></section>`;
}
