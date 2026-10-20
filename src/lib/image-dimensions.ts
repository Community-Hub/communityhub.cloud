import dimensions from "./image-dimensions.json";

/**
 * Intrinsic pixel size of a shipped /assets or /media photo, recorded from the
 * actual file. Rendered as width/height attributes so the browser reserves the
 * correct aspect box before the photo loads (no layout shift). Returns
 * undefined for a src that is not a recorded local photo; the img then renders
 * exactly as before. Keep the JSON truthful: tests/frame-assets.spec.ts
 * re-reads every file header and fails when a recorded size goes stale.
 */
export function imageSize(src: string): { width: number; height: number } | undefined {
  return (dimensions as Record<string, { width: number; height: number }>)[src];
}
