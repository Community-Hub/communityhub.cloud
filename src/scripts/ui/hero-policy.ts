export interface HeroPosition { hidden:boolean; away:boolean; scrollY:number; scheduledY:number; top:number }
/** Completion may advance only while the visitor remains at the original hero.
 * Viewport width deliberately has no role: desktop and phone share the story. */
export function mayAutoAdvanceHero(position:HeroPosition):boolean {
  return !position.hidden && !position.away && Math.abs(position.scrollY-position.scheduledY)<8 && position.top>=0;
}
