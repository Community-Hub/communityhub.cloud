/** Intersection alone does not establish visibility: inactive products occupy
 * the same CSS grid cell. Keep network activation tied to actual ownership. */
export function shouldLoadDeferredFrame(state:{loaded:boolean;inactive:boolean;visibility:string;width:number;height:number;top:number;bottom:number}, viewportHeight:number):boolean {
 return !state.loaded && !state.inactive && state.visibility !== 'hidden' && state.visibility !== 'collapse'
  && state.width > 0 && state.height > 0 && state.bottom > 0 && state.top < viewportHeight;
}
