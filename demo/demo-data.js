import { seededRandomSeries, smoothSeries } from './data-utils.js';

export const now = Math.floor(Date.now() / 1000);
export const POINT_COUNT = 75;
export const ZOOM_POINT_COUNT = 2000;

export const timestamps = Array.from({ length: POINT_COUNT }, (_, index) => now - (POINT_COUNT - index) * 900);
export const zoomTimestamps = Array.from(
  { length: ZOOM_POINT_COUNT },
  (_, index) => now - (ZOOM_POINT_COUNT - index) * 300,
);

export const cpuSeriesA = smoothSeries(seededRandomSeries(POINT_COUNT, 10, 80, 11), 3);
export const cpuSeriesB = smoothSeries(seededRandomSeries(POINT_COUNT, 5, 60, 77), 3);
export const cpuSeriesC = smoothSeries(seededRandomSeries(POINT_COUNT, 20, 95, 33), 3);
export const cpuSeriesAGapped = cpuSeriesA.map((value, index) =>
  (index >= 18 && index <= 28) || (index >= 50 && index <= 58) ? null : value,
);
export const cpuSeriesBGapped = cpuSeriesB.map((value, index) => (index >= 35 && index <= 44 ? null : value));

export const heapUsed = smoothSeries(seededRandomSeries(ZOOM_POINT_COUNT, 200, 600, 55), 8);
export const heapTotal = smoothSeries(seededRandomSeries(ZOOM_POINT_COUNT, 512, 768, 12), 6);
export const rss = smoothSeries(seededRandomSeries(ZOOM_POINT_COUNT, 350, 900, 38), 8);

export const diskReads = smoothSeries(seededRandomSeries(POINT_COUNT, 40, 320, 7), 4);
export const diskWrites = smoothSeries(seededRandomSeries(POINT_COUNT, 20, 180, 61), 4);
export const diskAwait = smoothSeries(seededRandomSeries(POINT_COUNT, 1, 24, 29), 3);

export const netInbound = smoothSeries(seededRandomSeries(POINT_COUNT, 512_000, 8_388_608, 17), 4);
export const netOutbound = smoothSeries(seededRandomSeries(POINT_COUNT, 131_072, 3_145_728, 83), 4);

export const memUsed = smoothSeries(seededRandomSeries(POINT_COUNT, 4_096, 12_288, 44), 5);
export const memCached = smoothSeries(seededRandomSeries(POINT_COUNT, 1_024, 3_072, 91), 5);
export const memBuffers = smoothSeries(seededRandomSeries(POINT_COUNT, 256, 1_024, 62), 4);

export const SCATTER_POINT_COUNT = 80;
export const scatterCpu = seededRandomSeries(SCATTER_POINT_COUNT, 5, 95, 37);
export const scatterLatency = scatterCpu.map((cpu, index) => {
  const noise = seededRandomSeries(1, -40, 40, index * 7 + 3)[0];
  return +(cpu * 6.5 + 80 + noise).toFixed(1);
});
export const scatterLatencyB = scatterCpu.map((cpu, index) => {
  const noise = seededRandomSeries(1, -30, 30, index * 11 + 5)[0];
  return +(cpu * 4.2 + 200 + noise).toFixed(1);
});
export const scatterLatencyC = scatterCpu.map((cpu, index) => {
  const noise = seededRandomSeries(1, -20, 20, index * 13 + 9)[0];
  return +(cpu * 2.8 + 350 + noise).toFixed(1);
});

export const HEATMAP_BUCKET_LABELS = ['0–10ms', '10–25ms', '25–50ms', '50–100ms', '100–250ms', '250–500ms', '500ms+'];

function buildHeatmapBucket(bucketIndex) {
  const gauss = Math.exp(-0.5 * ((bucketIndex - 2.5) / 1.3) ** 2);
  const raw = seededRandomSeries(POINT_COUNT, Math.max(1, gauss * 50), Math.max(2, gauss * 200), bucketIndex * 17 + 5);
  return smoothSeries(raw, 3).map((val) => Math.max(0, Math.round(val)));
}

export const heatmapData = [
  timestamps,
  ...HEATMAP_BUCKET_LABELS.map((_, bucketIndex) => buildHeatmapBucket(bucketIndex)),
];

export const BAR_POINT_COUNT = 30;
export const dailyTimestamps = Array.from(
  { length: BAR_POINT_COUNT },
  (_, index) => now - (BAR_POINT_COUNT - index) * 86400,
);
export const dailyRequests = seededRandomSeries(BAR_POINT_COUNT, 18_000, 95_000, 53);
export const dailyRequestsB = seededRandomSeries(BAR_POINT_COUNT, 12_000, 78_000, 31);
export const dailyRequestsC = seededRandomSeries(BAR_POINT_COUNT, 22_000, 88_000, 74);
export const dailyErrors = seededRandomSeries(BAR_POINT_COUNT, 80, 1_200, 27);
export const dailyP99 = smoothSeries(seededRandomSeries(BAR_POINT_COUNT, 120, 800, 66), 2);
export const dailyCost = seededRandomSeries(BAR_POINT_COUNT, 140, 420, 19);

export const BAR_GAUGE_CPU = [
  { label: 'prod-db-primary', value: 82 },
  { label: 'prod-db-replica-1', value: 45 },
  { label: 'prod-db-replica-2', value: 91 },
  { label: 'prod-web-01', value: 34 },
  { label: 'prod-web-02', value: 67 },
];

export const BAR_GAUGE_DISK = [
  { label: 'prod-db-primary', value: 380 },
  { label: 'prod-db-replica-1', value: 215 },
  { label: 'prod-db-replica-2', value: 450 },
  { label: 'prod-web-01', value: 67 },
  { label: 'prod-web-02', value: 124 },
];

export const BAR_GAUGE_AVAILABILITY = [
  { label: 'prod-db-primary', value: 98.2 },
  { label: 'prod-db-replica-1', value: 87.5 },
  { label: 'prod-db-replica-2', value: 99.9 },
  { label: 'prod-web-01', value: 76.1 },
  { label: 'prod-web-02', value: 94.3 },
];
