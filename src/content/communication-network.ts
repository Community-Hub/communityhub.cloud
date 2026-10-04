/** Original communication-network graphic recovered unchanged in meaning from
 * user-supplied CommunityHub-original-site_ts-20MB.zip, src/content/home.ts.
 * It connects community participants, unlike the separate platform dataflow.
 * Static final network is intentionally readable without automatic cycling. */
export function communicationNetwork(): string {
  const nodes = [
    ["City Government", "icon-cities.png"] as const,
    ["Business & Organizations", "icon-neighborhoods.png"] as const,
    ["Education", "icon-schools.png"] as const,
    ["Natural Environment", "icon-environment.png"] as const,
    ["Engaged Citizens", "icon-cv.png"] as const,
  ];
  const pts: readonly (readonly [number, number])[] = [[170,45],[284,160],[240,296],[100,296],[56,160]];
  const labels = ["City<br>Government", "Business &amp;<br>Organizations", "Education", "Natural<br>Environment", "Engaged<br>Citizens"];
  const node_html = nodes.map(([, ic], i) => `<li class="cn cn${i}" style="--x:${pts[i][0] / 340 * 100}%;--y:${pts[i][1] / 390 * 100}%"><img src="assets/${ic}" alt=""><span>${labels[i]}</span></li>`).join("");
  const links = pts.map(([x,y],i) => `<line class="cl" x1="170" y1="190" x2="${x}" y2="${y}" style="--i:${i}"/>`).join("");
  function trim(a:number,b:number,d=27): readonly [number,number,number,number] {
    const [[x1,y1],[x2,y2]]=[pts[a],pts[b]];
    const length=Math.hypot(x2-x1,y2-y1), ux=(x2-x1)/length, uy=(y2-y1)/length;
    return [x1+ux*d,y1+uy*d,x2-ux*d,y2-uy*d];
  }
  // Keep the eight source relationships; their presentation follows the current brief.
  const pairs: readonly (readonly [number,number])[] = [[0,1],[1,2],[2,3],[3,4],[4,0],[0,2],[0,3],[4,2]];
  const mesh = pairs.map(([a,b],i) => {
    const [x1,y1,x2,y2]=trim(a,b);
    return `<line class="nl" data-pair="${a}-${b}" x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" style="--i:${i}"/>`;
  }).join("");
  return `<figure class="conn" data-story-scene data-stage="3" aria-labelledby="conn-h" aria-describedby="conn-cap">
  <h3 class="conn-heading" id="conn-h">A community-centered communication platform</h3>
  <div class="conn-art">
    <svg class="conn-lines" viewBox="0 0 340 390" aria-hidden="true">${links}<g class="conn-mesh">${mesh}</g></svg>
    <div class="conn-core"><img src="assets/ro-ch.png" width="132" height="131" alt=""><span>Community Hub</span></div>
    <ul class="conn-nodes">${node_html}</ul>
  </div>
  <figcaption class="conn-cap" id="conn-cap">Community Hub provides a venue in which everyone can participate. Organizations doing good work connect with each other.</figcaption>
</figure>`;
}
