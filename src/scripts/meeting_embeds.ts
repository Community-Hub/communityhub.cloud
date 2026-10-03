import type { Context } from '../content/meeting-embeds';
import { reportedEmbedHeight } from './ui/embed-scroll';
import { freshDocumentUrl } from './ui/fresh-document-url';

// Only the selected context is mounted. Paired native story frames share a private web session.
document.querySelectorAll<HTMLElement>('[data-native-contexts]').forEach(root => {
  const config = JSON.parse(root.querySelector('[data-native-config]')!.textContent!) as Context[];
  const mount = root.querySelector<HTMLElement>('[data-native-mount]')!;
  const heading = root.querySelector<HTMLElement>('[data-native-heading]')!;
  const open = root.querySelector<HTMLAnchorElement>('[data-native-open]')!;
  const status = root.querySelector<HTMLElement>('[data-native-status]')!;
  let active = 0, mounted = false;
  /* Each community is built once and kept: switching back is a hide/show, not a reload. */
  const views = new Map<number, {view: HTMLElement; open: string; status: string}>();
  const idle = (run: () => void) => ('requestIdleCallback' in window ? (window as any).requestIdleCallback(run, {timeout: 1500}) : setTimeout(run, 200));
  const lean = () => !!(navigator as any).connection?.saveData;
  function frame(url:string,title:string,klass:string):HTMLIFrameElement {
    const f=document.createElement('iframe'); f.src=freshDocumentUrl(url); f.title=title; f.className=klass;
    f.setAttribute('data-native-direct',''); f.loading='lazy'; return f;
  }
  /* quiet: build a community's view in the background without switching to it. */
  function show(index:number, quiet=false) {
    const c=config[index];
    if(!quiet){
      if(!mounted) mount.replaceChildren();
      active=index; mounted=true; heading.replaceChildren();
      if(c.logo) {const logo=document.createElement('img');logo.src=c.logo;logo.alt='';heading.append(logo);}
      const name=document.createElement('span');name.textContent=c.name;heading.append(name);
      root.querySelectorAll<HTMLElement>('[data-native-choice]').forEach((b,i)=>b.setAttribute('aria-pressed',String(i===index)));
      views.forEach((v,i)=>{v.view.hidden=i!==index;});
    }
    const kept=views.get(index);
    if(kept){if(!quiet){open.href=kept.open;status.textContent=kept.status;}return;}
    const state={view:document.createElement('div'),open:c.url,status:''};
    state.view.className='native-view';state.view.hidden=quiet;views.set(index,state);
    if(!quiet){open.href=c.url;status.textContent='';
      // Other communities load quietly once this one has had time to paint, so the next switch is instant.
      if(root.dataset.kind==='voices'&&!lean())setTimeout(()=>idle(()=>config.forEach((_,i)=>{if(!views.has(i))show(i,true);})),2500);
    }
    mount.append(state.view);
    if(c.categories) {
      const stage=document.createElement('div');stage.className='native-voices-stage';
      const content=document.createElement('div');content.className='native-voices-content';content.setAttribute('data-scroll-owner','');content.tabIndex=0;content.setAttribute('role','region');content.setAttribute('aria-label',c.name+' voices and categories');
      const hint=document.createElement('p');hint.className='native-voices-hint';hint.textContent='Scroll to browse the community’s categories.';
      /* One frame per category, kept after its first load. The previous frame stays on screen until
         the next is ready, and a frame already loaded swaps in at once instead of reloading. */
      const phoneNow=()=>matchMedia('(max-width:699px)').matches;
      const frames=new Map<number,HTMLIFrameElement>();
      let wanted=0, warming=false;
      const urlFor=(id:number)=>{const url=new URL(c.url);if(id)url.searchParams.set('categories',String(id));else url.searchParams.delete('categories');if(phoneNow())url.searchParams.set('portrait-mode','1');return url.href;};
      const swap=(fr:HTMLIFrameElement)=>{frames.forEach(x=>x.classList.toggle('is-front',x===fr));stage.removeAttribute('data-loading');};
      const queue=c.categories.map(x=>x.id);
      const pump=()=>{
        const id=queue.shift();if(id===undefined)return;
        const fr=ensure(id);
        if(fr.dataset.ready)pump();else fr.addEventListener('load',()=>idle(pump),{once:true});
      };
      function ensure(id:number):HTMLIFrameElement {
        const have=frames.get(id);if(have)return have;
        const fr=frame(urlFor(id),c.name+' Community Voices','native-voices-screen');
        fr.tabIndex=-1;fr.loading='eager';fr.dataset.category=String(id);
        fr.addEventListener('load',()=>{
          fr.dataset.ready='1';
          if(wanted===id)swap(fr);
          if(!warming&&!lean()){warming=true;idle(pump);}
        });
        frames.set(id,fr);stage.append(fr);fit();return fr;
      }
      function fit() {
        const phone=phoneNow(), width=stage.clientWidth;
        if(!width&&!phone)return;
        frames.forEach((fr,id)=>{
          const url=new URL(fr.src);
          if(phone!==url.searchParams.has('portrait-mode')){fr.dataset.ready='';fr.src=freshDocumentUrl(urlFor(id));}
          fr.style.width=phone?'100%':'1100px';fr.style.height=phone?'500px':'619px';fr.style.transform=phone?'none':`scale(${width/1100})`;
        });
      }
      const categories=document.createElement('div');categories.className='native-categories';categories.setAttribute('role','group');categories.setAttribute('aria-label',c.name+' voice categories');
      const choices=[{id:0,name:'All voices',icon:''},...c.categories];
      choices.forEach(cat=>{
        const button=document.createElement('button');button.type='button';button.setAttribute('aria-pressed',String(cat.id===0));
        if(cat.icon){const image=document.createElement('img');image.src=cat.icon;image.alt='';image.loading='lazy';button.append(image);}
        const label=document.createElement('span');label.textContent=cat.name;button.append(label);
        /* Hover, focus and the start of a press all begin loading before the click lands. */
        ['pointerenter','focus','pointerdown','touchstart'].forEach(type=>button.addEventListener(type,()=>{if(!lean())ensure(cat.id);},{passive:true}));
        button.addEventListener('click',()=>{
          wanted=cat.id;
          const fr=ensure(cat.id);
          state.open=fr.src;open.href=fr.src;
          categories.querySelectorAll('button').forEach(b=>b.setAttribute('aria-pressed',String(b===button)));
          state.status=status.textContent=cat.name+' · '+c.name;
          if(fr.dataset.ready)swap(fr);else stage.setAttribute('data-loading','');
        });categories.append(button);
      });content.append(stage,categories);state.view.append(hint,content);
      new ResizeObserver(fit).observe(stage);
      const first=ensure(0);first.classList.add('is-front');
    } else if(c.display && c.remote && c.community) {
      const session=crypto.randomUUID();
      const display=new URL('https://config.communityhub.cloud/digital-signage/web-view/web-session');
      Object.entries({slideShow:'true',communitySubdomain:c.community,displayId:String(c.display),webEmbbed:'true',webSesssionId:session,activePage:'1'}).forEach(([k,v])=>display.searchParams.set(k,v));
      const pair=document.createElement('div');pair.className='native-story-pair';
      const tv=document.createElement('div');tv.className='native-tv-device';
      const tvScreen=document.createElement('div');tvScreen.className='native-tv-screen';
      const tvFrame=frame(display.href,c.name+' story display','native-story-screen');tvScreen.append(tvFrame);tv.append(tvScreen);
      const phone=document.createElement('div');phone.className='native-phone-device';
      const phoneScreen=document.createElement('div');phoneScreen.className='native-phone-screen';
      const phoneFrame=frame(`https://${c.community}.communityhub.cloud/digital-signage/remote/${c.remote}?webSesssionId=${session}&standalone`,c.name+' story controller','native-story-controller');phoneScreen.append(phoneFrame);phone.append(phoneScreen);
      pair.append(tv,phone);state.view.append(pair);
      const fitDevices=()=>{tvFrame.style.width='1280px';tvFrame.style.height='720px';tvFrame.style.transform=`scale(${tvScreen.clientWidth/1280})`;phoneFrame.style.width='100%';phoneFrame.style.height='100%';phoneFrame.style.transform='none';};
      const deviceResize=new ResizeObserver(fitDevices);deviceResize.observe(tvScreen);deviceResize.observe(phoneScreen);fitDevices();
    } else {
      const viewport=document.createElement('div');viewport.className='native-application-viewport';viewport.setAttribute('role','region');viewport.setAttribute('aria-label',c.name+' '+root.dataset.kind);viewport.tabIndex=0;
      const f=frame(c.embedUrl || c.url,c.name+' '+root.dataset.kind,'native-application');viewport.append(f);state.view.append(viewport);
      if(root.dataset.kind==='voices') {
        f.dataset.contentHeight='850';
        const fit=()=>{if(f.hasAttribute('data-embed-measured-frame'))return;const scale=Math.min(1,viewport.clientWidth/1100); f.style.width='1100px';f.style.height=f.dataset.contentHeight+'px';f.style.transform=`scale(${scale})`;viewport.style.height=Math.min(500,Number(f.dataset.contentHeight)*scale)+'px';};
        const resize=new ResizeObserver(fit);resize.observe(viewport);fit();
      }
    }
  }
  root.querySelectorAll<HTMLElement>('[data-native-choice]').forEach(b=>b.addEventListener('click',()=>show(Number(b.dataset.nativeChoice))));
  const maybeMount=()=>{
    if(mounted || root.closest('[inert]') || getComputedStyle(root).visibility==='hidden')return;
    const bounds=root.getBoundingClientRect();
    if(bounds.bottom>=0 && bounds.top<=innerHeight+100)show(active);
  };
  new IntersectionObserver(entries=>{if(entries.some(e=>e.isIntersecting))maybeMount();},{rootMargin:'100px'}).observe(root);
  window.addEventListener('ch:storychange',maybeMount);
  const panel=root.closest('[data-eng-panel]');
  if(panel)new MutationObserver(maybeMount).observe(panel,{attributes:true,attributeFilter:['inert']});
  // Application resize messages are fitted by the shared embed-scroll module.
});

document.querySelectorAll<HTMLElement>('[data-phone-demo]').forEach(root=>{
  const screen=root.querySelector<HTMLImageElement>('[data-phone-screen]')!;
  const preview=root.querySelector<HTMLImageElement>('[data-phone-preview]')!;
  const status=root.querySelector<HTMLElement>('[data-phone-status]')!;
  const scan=root.querySelector<HTMLButtonElement>('[data-phone-scan]')!;
  const menu=root.querySelector<HTMLElement>('[data-phone-menu]')!;
  const channels=root.querySelector<HTMLElement>('[data-phone-channels]')!;
  const caption=root.querySelector<HTMLElement>('[data-phone-caption]')!;
  const selection=root.querySelector<HTMLElement>('[data-phone-selection]')!;
  const hint=root.querySelector<HTMLElement>('[data-phone-hint]')!;
  const choices=[...root.querySelectorAll<HTMLButtonElement>('[data-phone-channel]')];
  const content={
    heating:{image:'assets/art-geothermal-band.jpg',title:'Heating & Cooling',alt:'Source illustration of Oberlin’s geothermal heating and cooling system',caption:'Heating & Cooling: Oberlin’s campus geothermal system.'},
    ajlc:{image:'assets/phone-workflow/ajlc-electricity-recorded.png',title:'AJLC electricity',alt:'Recorded Adam Joseph Lewis Center electricity display, not current readings',caption:'Recorded AJLC electricity display. Its “LIVE” label belongs to the capture, not current readings.'},
  } as const;
  function show(key:keyof typeof content){
    const item=content[key];screen.src=item.image;screen.alt=item.alt;preview.src=item.image;caption.textContent=item.caption;
  }
  scan.addEventListener('click',()=>{
    menu.hidden=true;channels.hidden=false;root.dataset.phase='choose';
    status.textContent='Choose Heating & Cooling or AJLC to change this example display.';
    hint.textContent='Choose what appears on the screen';
    choices[0]?.focus({preventScroll:true});
  });
  choices.forEach(button=>button.addEventListener('click',()=>{
    const key=button.dataset.phoneChannel;
    if(key!=='heating'&&key!=='ajlc')return;
    show(key);root.dataset.phase='selected';
    selection.textContent=content[key].title+' selected';
    status.textContent=content[key].title+' is now showing on this example display.';
    hint.textContent='Choose another example to change the screen';
    choices.forEach(choice=>choice.setAttribute('aria-pressed',String(choice===button)));
  }));
  root.querySelector('[data-phone-reset]')!.addEventListener('click',()=>{
    menu.hidden=false;channels.hidden=true;root.dataset.phase='menu';show('ajlc');
    selection.textContent='Your choice appears on the display.';
    choices.forEach(choice=>choice.setAttribute('aria-pressed','false'));
    status.textContent='At a sign, scan its QR code. Here, tap Screen Controller.';
    hint.textContent='Tap Screen Controller';scan.focus({preventScroll:true});
  });
});

// The source's desktop layout keeps its building photo and gauges side by side.
// A scaled canvas lives inside a real parent scroller, so wheel/touch can hand off at its edges.
document.querySelectorAll<HTMLIFrameElement>('[data-native-scroll-frame]').forEach(f=>{
 const canvas=f.parentElement!, viewport=canvas.parentElement!;
 let sourceHeight=Number(f.height)||1500;
 function fit(){const scale=Math.min(1,viewport.clientWidth/1100);canvas.style.height=(sourceHeight*scale)+'px';f.style.width='1100px';f.style.height=sourceHeight+'px';f.style.transform=`scale(${scale})`;}
 new ResizeObserver(fit).observe(viewport);fit();
 window.addEventListener('message',event=>{
  const url=f.src||f.dataset.deferSrc;
  if(!url||event.source!==f.contentWindow||event.origin!==new URL(url).origin)return;
  if(event.data?.messageType!=='content-resize')return;
  const height=reportedEmbedHeight(event.data.height);
  if(height!==null){sourceHeight=height;f.setAttribute('data-native-scroll-height-confirmed','');f.setAttribute('scrolling','no');fit();window.dispatchEvent(new Event('ch:embed-scrollchange'));}
 });
});
