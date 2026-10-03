/** Use the uploaded media's real intrinsic widths instead of filename suffixes.
 * The upload includes optimized derivatives, so a name ending in -1600 can be
 * only 960 pixels wide. Duplicate width descriptors are invalid in a srcset.
 */
export function responsiveCandidates(
  candidates: readonly (readonly [file: string, historicalWidth: number])[],
  metadata: Readonly<Record<string, readonly number[]>>,
): readonly (readonly [file: string, width: number])[] {
  const widths = new Set<number>();
  return candidates.flatMap(([file]) => {
    const width = metadata[`assets/${file}`]?.[0];
    if (!width || widths.has(width)) return [];
    widths.add(width);
    return [[file, width] as const];
  }).sort((a, b) => a[1] - b[1]);
}
