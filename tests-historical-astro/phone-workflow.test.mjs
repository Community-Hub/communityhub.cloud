import { before, test } from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { runInNewContext } from 'node:vm';
import ts from 'typescript';
import { build } from 'vite';
let phoneDemo;
before(async()=>{
 const result=await build({configFile:false,logLevel:'silent',build:{write:false,minify:false,lib:{entry:'src/content/meeting-embeds.ts',formats:['es']}}});
 const code=(Array.isArray(result)?result[0]:result).output[0].code;
 ({phoneDemo}=await import(`data:text/javascript;base64,${Buffer.from(code).toString('base64')}`));
});
test('walkthrough uses supplied product pieces and identifies recorded readings',()=>{
 const html=phoneDemo();
 assert.match(html,/phone-workflow\/oberlin-hub-menu\.png/);
 assert.match(html,/phone-workflow\/carbon-neutral-controller\.png/);
 assert.match(html,/phone-workflow\/ajlc-electricity-recorded\.png/);
 assert.match(html,/Recorded/);assert.match(html,/not current readings/);
 assert.match(html,/data-phone-channel="heating"/);assert.match(html,/data-phone-channel="ajlc"/);
 assert.doesNotMatch(html,/data-phone-channel="voices"|data-phone-channel="calendar"|<canvas|qrcode|image149|Simulate scanning/);
 assert.match(html,/aria-label="Replay phone walkthrough"/);
 assert.match(html,/At a sign, scan its QR code\. Here, tap Screen Controller\./);
});

test('local walkthrough opens the controller, selects source content and resets without timers or network',async()=>{
 const source=await readFile('src/scripts/meeting_embeds.ts','utf8');
 const part=source.slice(source.indexOf("document.querySelectorAll<HTMLElement>('[data-phone-demo]')"),source.indexOf('// The source\'s desktop layout'));
 const code=ts.transpileModule(part,{compilerOptions:{target:ts.ScriptTarget.ES2022}}).outputText;
 const node=()=>({hidden:false,dataset:{},attrs:new Map(),events:new Map(),textContent:'',src:'',alt:'',addEventListener(t,f){this.events.set(t,f)},setAttribute(n,v){this.attrs.set(n,v)},focus(){this.focused=true},emit(t){this.events.get(t)?.()},querySelector(){return heating}});
 const root=node(),screen=node(),preview=node(),status=node(),scan=node(),menu=node(),channels=node(),caption=node(),selection=node(),hint=node(),reset=node(),heating=node(),ajlc=node();
 heating.dataset.phoneChannel='heating';ajlc.dataset.phoneChannel='ajlc';channels.hidden=true;
 const map={'[data-phone-screen]':screen,'[data-phone-preview]':preview,'[data-phone-status]':status,'[data-phone-scan]':scan,'[data-phone-menu]':menu,'[data-phone-channels]':channels,'[data-phone-caption]':caption,'[data-phone-selection]':selection,'[data-phone-hint]':hint,'[data-phone-reset]':reset};
 root.querySelector=s=>map[s]||null;root.querySelectorAll=()=>[heating,ajlc];
 runInNewContext(code,{document:{querySelectorAll:()=>[root],addEventListener(){}},matchMedia:()=>({matches:false,addEventListener(){}}),IntersectionObserver:class{observe(){}},clearInterval(){},window:{setInterval(){throw new Error('Walkthrough must not auto-cycle')}},fetch(){throw new Error('Local walkthrough must not control remote displays')}});
 scan.emit('click');assert.equal(menu.hidden,true);assert.equal(channels.hidden,false);assert.equal(heating.focused,true);
 heating.emit('click');assert.match(screen.src,/art-geothermal-band\.jpg$/);assert.equal(heating.attrs.get('aria-pressed'),'true');assert.match(status.textContent,/Heating & Cooling/);
 ajlc.emit('click');assert.match(screen.src,/ajlc-electricity-recorded\.png$/);assert.match(caption.textContent,/not current readings/);assert.equal(heating.attrs.get('aria-pressed'),'false');assert.equal(ajlc.attrs.get('aria-pressed'),'true');
 reset.emit('click');assert.equal(menu.hidden,false);assert.equal(channels.hidden,true);assert.equal(scan.focused,true);assert.equal(root.dataset.phase,'menu');
 assert.equal(status.textContent,'At a sign, scan its QR code. Here, tap Screen Controller.');
});
