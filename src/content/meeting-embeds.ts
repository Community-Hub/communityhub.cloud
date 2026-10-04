import { VOICES_CATEGORIES } from "./voices-categories";
/** Native public applications and explicitly local demonstrations, October 1 review. */
const esc = (s: string) => s.replaceAll('&','&amp;').replaceAll('"','&quot;').replaceAll('<','&lt;');
export type Context = {name:string; url:string; embedUrl?:string; logo?:string; display?:number; remote?:string; community?:string; categories?: {id:number;name:string;icon:string}[]};
const storage = 'https://communityhubstorage.cloud/ch-digital-signage';
export const storyContexts: Context[] = [
 {name:'Oberlin College',url:'https://oberlin.communityhub.cloud/dh-public/oc-embed?active-page=exploreStories',logo:`${storage}/oberlin/digital-signage/oberlin-college-logo.svg`,display:149,remote:'custom/oc-carbon-neutral-admissions',community:'oberlin'},
 {name:'Great Lakes Science Center',url:'https://cleveland.communityhub.cloud/dh-public/glsc-embed?active-page=exploreStories',logo:`${storage}/glsc/digital-signage/glsc-logo.png`,display:112,remote:'106',community:'glsc'},
];
export function nativeContexts(kind:string, contexts:Context[]):string {
 const first=contexts[0];
 return `<div class="meeting-embed" data-native-contexts data-kind="${kind}">
 ${contexts.length > 1 ? `<div class="native-choices" role="group" aria-label="Choose ${kind} community">${contexts.map((c,i)=>`<button type="button" data-native-choice="${i}" aria-pressed="${i===0}">${esc(c.name)}</button>`).join('')}</div>` : ''}
 <h4 class="native-heading" data-native-heading>${first.logo?`<img src="${esc(first.logo)}" alt="" loading="lazy">`:''}<span>${esc(first.name)}</span></h4>
 <div data-native-mount>${kind === 'stories' ? '<div class="native-story-pair"><div class="native-tv-device"><div class="native-tv-screen"><span class="native-loading" role="status">Loading the story…</span></div></div><div class="native-phone-device" data-squirrel="Try the controller. It works! Choose a story on the phone to change this display." data-squirrel-side="top" data-squirrel-short="Try it"><div class="native-phone-screen"><span class="native-loading">Loading controller…</span></div></div></div>' : '<p>Loading the community application…</p>'}</div>
 <p class="native-caption"><span class="sr-only" role="status" aria-live="polite" data-native-status></span> <a data-native-open href="${esc(first.url)}" target="_blank" rel="noopener">Open full size</a></p>
 <script type="application/json" data-native-config>${JSON.stringify(contexts).replaceAll('<','\\u003c')}</script></div>`;
}
export const nativeStories = () => nativeContexts('stories',storyContexts);
export const nativeVoices = () => nativeContexts('voices',[
 {name:'MidTown Cleveland',url:'https://cleveland.communityhub.cloud/cv-public/digital-signage?image_tags=36',logo:'https://communityhubstorage.cloud/ch-community-voices/cleveland/community-voices/Midtown_White_edited.png',categories:VOICES_CATEGORIES.midtown},
 {name:'Great Lakes Science Center',url:'https://cleveland.communityhub.cloud/cv-public/digital-signage',logo:`${storage}/glsc/digital-signage/glsc-logo.png`,categories:VOICES_CATEGORIES.glsc},
 {name:'Oberlin',url:'https://oberlin.communityhub.cloud/cv-public/digital-signage',logo:'https://environmentaldashboard.org/images/uploads/2015/07/ob-300x300.jpg',categories:VOICES_CATEGORIES.oberlin},
]);
export const nativeCitywide = () => nativeContexts('citywide',[
 {name:'Oberlin',url:'https://www.environmentaldashboard.org/cwd?show-menu-bar=1',embedUrl:'https://www.environmentaldashboard.org/cwd-files/dashboard.php?interval=&current_state='},
 {name:'Cleveland',url:'https://cleveland.communityhub.cloud/citywide-dashboard/index?embed=1&show-menu=0'},
]);
export function nativeScrollable(url:string,title:string,height:number):string {
 return `<div class="native-scroll-feature"><h4 class="native-heading">${esc(title)}</h4><div class="native-scroll" data-scroll-owner data-squirrel="Scroll down to explore" data-squirrel-short="Scroll down" tabindex="0" role="region" aria-label="${esc(title)}"><div class="native-scroll-canvas"><iframe data-native-scroll-frame data-defer-src="${esc(url)}" title="${esc(title)}" width="100%" height="${height}" loading="lazy"></iframe></div></div></div>`;
}
export function phoneDemo():string {
 const arrow='<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m9 5 7 7-7 7"/></svg>';
 return `<div class="phone-demo phone-workflow" data-phone-demo data-phase="menu">
  <p class="pw-status" role="status" aria-live="polite" data-phone-status>At a sign, scan its QR code. Here, tap Screen Controller.</p>
  <div class="pw-stage">
   <figure class="pw-tv">
    <div class="pw-tv-bezel"><div class="pw-tv-screen"><img data-phone-screen src="assets/phone-workflow/ajlc-electricity-recorded.png" width="1708" height="936" alt="Recorded Adam Joseph Lewis Center electricity display, not current readings" loading="lazy"></div></div>
    <figcaption data-phone-caption>Recorded AJLC electricity display. Its “LIVE” label belongs to the capture, not current readings.</figcaption>
   </figure>
   <div class="pw-phone-column">
    <div class="pw-phone">
     <div class="pw-phone-glass">
      <div class="pw-menu" data-phone-menu><img src="assets/phone-workflow/oberlin-hub-menu.png" width="750" height="1334" alt="Oberlin Hub community menu, with Screen Controller at the upper left" loading="lazy"><button type="button" class="pw-controller-entry" data-phone-scan aria-label="Open Screen Controller in this demonstration" title="Open Screen Controller"><span class="pw-sr">Open Screen Controller</span></button></div>
      <div class="pw-picker" data-phone-channels data-scroll-owner role="region" aria-label="Screen Controller examples" hidden>
       <div class="pw-source-heading"><img src="assets/phone-workflow/carbon-neutral-controller.png" width="398" height="810" alt="Carbon Neutral Stories" loading="lazy"></div>

       <div class="pw-choices" role="group" aria-label="Content for this example display">
        <button type="button" class="pw-choice" data-phone-channel="heating" aria-pressed="false"><img src="assets/story-ic-heating-96.png" width="36" height="36" alt=""><span>Heating &amp; Cooling</span>${arrow}</button>
        <button type="button" class="pw-choice" data-phone-channel="ajlc" aria-pressed="false"><img src="assets/story-ic-ajlc-96.png" width="36" height="36" alt=""><span>AJLC</span>${arrow}</button>
       </div>
       <p class="pw-selection sr-only" aria-hidden="true" data-phone-selection>Your choice appears on the display.</p>
       <div class="pw-phone-preview" aria-hidden="true"><img data-phone-preview src="assets/phone-workflow/ajlc-electricity-recorded.png" width="1708" height="936" alt=""></div>
      </div>
     </div>
    </div>
    <p class="pw-phone-hint sr-only" aria-hidden="true" data-phone-hint>Tap Screen Controller</p>
   </div>
  </div>
  <div class="pw-foot"><button type="button" class="pw-replay" data-phone-reset aria-label="Replay phone walkthrough" title="Replay phone walkthrough"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 10a8 8 0 1 1 1 8M4 4v6h6"/></svg></button></div>
  <noscript><p>At a digital sign, scan its QR code, open Screen Controller and choose content. That content appears on the shared screen.</p></noscript>
 </div>`;
}
