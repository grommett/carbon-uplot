import { highlight } from 'https://esm.sh/sugar-high';
import uPlot from 'uplot';
import {
  createLineChart,
  createAreaChart,
  createBarChart,
  createScatterChart,
  createGauge,
  createStat,
  createHeatmap,
  createBarGauge,
} from '/dist/carbon-uplot.esm.js';
import {
  timestamps,
  cpuSeriesA,
  cpuSeriesB,
  cpuSeriesC,
  dailyTimestamps,
  dailyRequests,
  heatmapData,
  BAR_GAUGE_CPU,
} from '/demo/demo-data.js';
import { seededRandomSeries } from '/demo/data-utils.js';

document.querySelectorAll('.cu-overview__code code').forEach((code) => {
  const text = code.textContent.replace(/^\n/, '').trimEnd();
  code.innerHTML = highlight(text);
});

/** Chart type preview thumbnails */

const DENSE_COUNT = 400;
const denseX = seededRandomSeries(DENSE_COUNT, 5, 95, 42);
const denseNoise1 = seededRandomSeries(DENSE_COUNT, -30, 30, 11);
const denseNoise2 = seededRandomSeries(DENSE_COUNT, -25, 25, 23);
const denseNoise3 = seededRandomSeries(DENSE_COUNT, -20, 20, 37);
const denseY1 = denseX.map((x, i) => +(x * 5.8 + 90 + denseNoise1[i]).toFixed(1));
const denseY2 = denseX.map((x, i) => +(x * 3.5 + 210 + denseNoise2[i]).toFixed(1));
const denseY3 = denseX.map((x, i) => +(x * 2.1 + 350 + denseNoise3[i]).toFixed(1));

const THUMB_AXES = [{ show: false }, { show: false }];
const THUMB_BASE = {
  legend: false,
  tooltip: false,
  cursor: { show: false },
  axes: THUMB_AXES,
  padding: [8, 8, 8, 8],
  height: 120,
};
const NO_POINTS = { points: { show: false } };
const spline = uPlot.paths.spline();
const SMOOTH = { paths: spline, ...NO_POINTS };

createLineChart(document.getElementById('cu-preview-line'), {
  data: [timestamps, cpuSeriesA, cpuSeriesB, cpuSeriesC],
  series: [{ ...NO_POINTS }, { ...NO_POINTS }, { ...NO_POINTS }],
  ...THUMB_BASE,
});

createAreaChart(document.getElementById('cu-preview-area'), {
  data: [timestamps, cpuSeriesA, cpuSeriesB, cpuSeriesC],
  series: [{ ...SMOOTH }, { ...SMOOTH }, { ...SMOOTH, color: '#ff7eb6' }],
  ...THUMB_BASE,
});

createBarChart(document.getElementById('cu-preview-bar'), {
  data: [dailyTimestamps, dailyRequests],
  series: [{}],
  ...THUMB_BASE,
});

createScatterChart(document.getElementById('cu-preview-scatter'), {
  data: [denseX, denseY1, denseY2, denseY3],
  series: [{}, {}, {}],
  ...THUMB_BASE,
});

createGauge(document.getElementById('cu-preview-gauge'), {
  value: 72,
  ticks: false,
  color: '#8a3ffc',
});

createStat(document.getElementById('cu-preview-stat'), {
  data: [timestamps, cpuSeriesA],
  value: Math.floor(cpuSeriesA.at(-1)),
  showValue: true,
  valueFormat: (value) => `${value.toFixed(0)}%`,
});

createHeatmap(document.getElementById('cu-preview-heatmap'), {
  data: heatmapData,
  tooltip: false,
  height: 120,
});

createBarGauge(document.getElementById('cu-preview-bar-gauge'), {
  series: BAR_GAUGE_CPU,
  thresholds: [
    { value: 70, status: 'warning' },
    { value: 85, status: 'error' },
  ],
  valueFormat: (v) => `${v}%`,
});
