/** The first Who We Are scene has one identity animation and one reading hold.
 * It may advance once. Manual departure/input disarms that advance permanently;
 * animation time still genuinely pauses and resumes, and revisits remain static.
 */
export type IdentityPhase = 'ready' | 'identity' | 'reading' | 'complete';
type PauseReason = 'offscreen' | 'document' | 'hover' | 'focus';
interface Clock {
  now(): number;
  setTimeout(callback: () => void, delay: number): number;
  clearTimeout(id: number): void;
}
interface SequenceOptions {
  clock?: Clock;
  onPhase(phase: IdentityPhase): void;
  onPause?(paused: boolean): void;
  onComplete?(): void;
}
export interface IdentitySequence {
  readonly phase: IdentityPhase;
  readonly paused: boolean;
  pause(reason: PauseReason): void;
  resume(reason: PauseReason): void;
  settle(): void;
}
const phases = [['identity',2400],['reading',6600],['complete',0]] as const;

export function createIdentitySequence(options: SequenceOptions): IdentitySequence {
  const clock = options.clock ?? {
    now: () => performance.now(),
    setTimeout: (callback,delay) => window.setTimeout(callback,delay),
    clearTimeout: id => window.clearTimeout(id),
  };
  const gates = new Set<PauseReason>(['offscreen']);
  let index=-1, phase: IdentityPhase='ready', remaining=0, startedAt=0, timer: number | undefined;
  function cancel(): void {
    if (timer===undefined) return;
    clock.clearTimeout(timer); timer=undefined;
    remaining=Math.max(0,remaining-(clock.now()-startedAt));
  }
  function schedule(): void {
    if (gates.size || timer!==undefined || phase==='complete') return;
    if (index<0) { go(0); return; }
    startedAt=clock.now();
    timer=clock.setTimeout(() => { timer=undefined; go(index+1,true); },remaining);
  }
  function go(next: number, elapsed=false): void {
    cancel(); index=Math.min(next,phases.length-1); [phase,remaining]=phases[index];
    options.onPhase(phase);
    if (phase==='complete') { if (elapsed) options.onComplete?.(); }
    else schedule();
  }
  options.onPhase('ready');
  return {
    get phase() { return phase; },
    get paused() { return gates.size>0; },
    pause(reason) {
      const wasPaused=gates.size>0; gates.add(reason); cancel();
      if (!wasPaused) options.onPause?.(true);
    },
    resume(reason) {
      const wasPaused=gates.size>0; gates.delete(reason);
      if (wasPaused && !gates.size) options.onPause?.(false);
      schedule();
    },
    settle() { go(phases.length-1); },
  };
}

export function enhanceIdentityExplanation(): void {
  for (const section of document.querySelectorAll<HTMLElement>('[data-identity-explanation]')) {
    if (section.dataset.identityEnhanced) continue;
    const content=section.querySelector<HTMLElement>('[data-identity-content]');
    const roll=section.querySelector<HTMLElement>('[data-roll]');
    if (!content || !roll) continue;
    const media=matchMedia('(prefers-reduced-motion: reduce)');
    const hoverMedia=matchMedia('(hover: hover)');
    let visible=false, entered=false, automatic=true, advanceConsumed=false;
    let animations: Animation[]=[], flow: IdentitySequence | undefined;
    section.dataset.identityEnhanced='true'; roll.classList.add('on');
    const ownsScene=(): boolean => !window.chStory || !!window.chStory.current()?.els.includes(section);
    const stopAnimations=(): void => { animations.forEach(animation=>animation.cancel()); animations=[]; };
    function show(phase: IdentityPhase): void {
      stopAnimations(); section.dataset.sequencePhase=phase;
      if (phase!=='identity' || media.matches) return;
      for (const image of roll!.querySelectorAll<HTMLImageElement>('img')) {
        if (!('animate' in image)) continue;
        const position=Number(image.style.getPropertyValue('--k') || 0);
        const animation=image.animate([
          {opacity:1,transform:position ? `translateX(${-position*18}px) scale(.86)` : 'scale(.94)'},
          {opacity:1,transform:'none'},
        ],{duration:1500,delay:Math.abs(position)*260,easing:'cubic-bezier(.16,1,.3,1)',fill:'backwards'});
        animations.push(animation); if (flow?.paused) animation.pause();
      }
    }
    function advanceOnce(): void {
      if (advanceConsumed) return;
      advanceConsumed=true;
      if (!automatic || !visible || document.hidden || media.matches || !ownsScene()) return;
      const story=window.chStory;
      if (!story) return;
      const frames=story.frames(), current=story.current();
      if (!current?.els.includes(section)) return;
      const next=frames.find(frame=>frame.y>current.y+1 && !frame.els.includes(section));
      if (!next) return;
      // The existing scene owner performs the cut. Any internal reading tail
      // in this one scene is skipped; no other scene gains automatic playback.
      window.dispatchEvent(new CustomEvent('ch:fit',{detail:{anchor:next}}));
    }
    flow=createIdentitySequence({
      onPhase:show,
      onComplete:advanceOnce,
      onPause:paused=>{
        section.dataset.identityPaused=String(paused);
        for (const animation of animations) {
          if (animation.playState==='finished' || animation.playState==='idle') continue;
          if (paused) animation.pause(); else animation.play();
        }
      },
    });
    const sequence=flow;
    function syncVisibility(): void {
      const active=visible && ownsScene();
      if (!active && entered && !document.hidden) automatic=false;
      if (active) { entered=true; sequence.resume('offscreen'); }
      else sequence.pause('offscreen');
    }
    const visibility=(): void => {
      if (document.hidden) sequence.pause('document');
      else { syncVisibility(); sequence.resume('document'); }
    };
    visibility(); document.addEventListener('visibilitychange',visibility);
    window.addEventListener('ch:storychange',syncVisibility);
    roll.addEventListener('mouseenter',()=>{if(hoverMedia.matches) sequence.pause('hover');});
    roll.addEventListener('mouseleave',()=>sequence.resume('hover'));
    content.addEventListener('focusin',()=>sequence.pause('focus'));
    content.addEventListener('focusout',()=>queueMicrotask(()=>{
      if (!content.contains(document.activeElement)) sequence.resume('focus');
    }));
    // Explicit navigation always takes priority over the timed first visit.
    const manualIntent=(): void => { if (entered && ownsScene()) automatic=false; };
    window.addEventListener('wheel',manualIntent,{passive:true});
    window.addEventListener('touchmove',manualIntent,{passive:true});
    window.addEventListener('pointerdown',manualIntent,{passive:true});
    window.addEventListener('keydown',event=>{
      if (['PageDown','PageUp','ArrowDown','ArrowUp','Home','End',' '].includes(event.key)) manualIntent();
    });
    media.addEventListener('change',()=>{
      if (media.matches) { automatic=false; sequence.settle(); }
    });
    if (media.matches || !('IntersectionObserver' in window)) {
      automatic=false; sequence.settle(); continue;
    }
    new IntersectionObserver(entries=>{
      visible=entries.some(entry=>entry.isIntersecting && entry.intersectionRatio>=.35);
      syncVisibility();
    },{threshold:[0,.35,.6]}).observe(content);
  }
}
