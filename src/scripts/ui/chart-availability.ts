import type { ChartData } from '../data';
/** Missing measurements are not a meaningful heatmap, including a successful empty response. */
export function hasUsableHeatReadings(data: ChartData): boolean {
  return Boolean(data.data[0]?.data.some(point =>
    Number.isFinite(point.storageValue) && Number.isFinite(point.binPosition) &&
    Number.isFinite(Date.parse(point.timestamp)),
  ));
}
