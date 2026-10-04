/** The interior platform model reveals eight source steps, then holds.
 * Content hover/focus, visibility and hidden tabs preserve the exact remaining
 * interval. Manual arrows opt into stable step-by-step inspection. This model
 * never advances the page or shares the homepage identity's automatic behavior.
 */
export function enhanceHubFlows(): void {
  for (const root of document.querySelectorAll<HTMLElement>('[data-hub-flow]')) {
    if (root.dataset.hfEnhanced) continue;
    const parts=[...root.querySelectorAll<HTMLElement>('[data-hf-step]')];
    const say=root.querySelector<HTMLElement>('[data-hf-say]');
    const controls=root.querySelector<HTMLElement>('[data-hf-controls]');
    const back=root.querySelector<HTMLButtonElement>('[data-hf-back]');
    const next=root.querySelector<HTMLButtonElement>('[data-hf-next]');
    const data=root.querySelector<HTMLScriptElement>('[data-hf-steps]');
    if (!say || !controls || !back || !next || !data) continue;
    let steps: string[];
    try {
      const parsed: unknown=JSON.parse(data.textContent || '[]');
      if (!Array.isArray(parsed) || !parsed.length || !parsed.every(item=>typeof item==='string')) continue;
      steps=parsed;
    } catch { continue; }
    const total=steps.length, delay=4200;
    const reduced=window.matchMedia('(prefers-reduced-motion: reduce)');
    const section=root.closest<HTMLElement>('section') || root;
    const grid=root.querySelector<HTMLElement>('.hf-grid');
    let step=reduced.matches || !('IntersectionObserver' in window) ? total : 1;
    let timer: number | undefined, startedAt=0, remaining=delay;
    let visible=false, hovered=false, focused=false, manual=false;
    root.dataset.hfEnhanced='true';

    function show(scrollToReveal=false): void {
      root.dataset.step=String(step);
      parts.forEach(part=>{
        const on=Number(part.dataset.hfStep)<=step;
        part.classList.toggle('is-on',on); part.inert=!on;
        part.classList.toggle('is-new',Number(part.dataset.hfStep)===step);
        const until=Number(part.dataset.hfUntil || part.dataset.hfStep);
        part.classList.toggle('is-active',on && step<=until);
      });
      say!.textContent=steps[step-1];
      back!.disabled=step===1;
      const label=step===total ? 'Replay explanation' : 'Next explanation step';
      next!.setAttribute('aria-label',label); next!.setAttribute('title',label);
      // Change only the action's accessible name. Its native chevron remains.
      const latest=root.querySelector<HTMLElement>(`[data-hf-focus="${step}"]`) || parts.find(part=>part.matches('li') && Number(part.dataset.hfStep)===step);
      if (scrollToReveal && grid && latest && grid.scrollHeight>grid.clientHeight+1 && !reduced.matches) {
        grid.scrollTop=latest.getBoundingClientRect().top-grid.getBoundingClientRect().top+grid.scrollTop-8;
      }
    }
    function freeze(): void {
      if (timer===undefined) return;
      window.clearTimeout(timer); timer=undefined;
      remaining=Math.max(0,remaining-(performance.now()-startedAt));
    }
    function syncPlayback(): void {
      const canRun=visible && !document.hidden && !hovered && !focused && !manual && !reduced.matches && step<total;
      root.dataset.hfPaused=String(!canRun);
      if (!canRun) { freeze(); return; }
      if (timer!==undefined) return;
      startedAt=performance.now();
      timer=window.setTimeout(()=>{
        timer=undefined; step=Math.min(total,step+1); remaining=delay;
        show(true); syncPlayback();
      },remaining);
    }
    function manualStep(nextStep: number): void {
      manual=true; freeze(); step=nextStep; remaining=delay;
      show(true); syncPlayback();
    }
    next.addEventListener('click',()=>manualStep(step===total ? 1 : step+1));
    back.addEventListener('click',()=>manualStep(Math.max(1,step-1)));
    section.addEventListener('mouseenter',()=>{hovered=true;syncPlayback();});
    section.addEventListener('mouseleave',()=>{hovered=false;syncPlayback();});
    section.addEventListener('focusin',()=>{focused=true;syncPlayback();});
    section.addEventListener('focusout',()=>queueMicrotask(()=>{
      focused=section.contains(document.activeElement); syncPlayback();
    }));
    document.addEventListener('visibilitychange',syncPlayback);
    reduced.addEventListener('change',()=>{
      if (reduced.matches) { freeze();step=total;show(); }
      syncPlayback();
    });
    root.classList.add('is-enhanced'); controls.hidden=false; show();
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(entries=>{
        visible=entries.some(entry=>entry.isIntersecting && entry.intersectionRatio>=.35);
        syncPlayback();
      },{threshold:[0,.35,.6]}).observe(root);
    }
  }
}

if (typeof document!=='undefined') enhanceHubFlows();
