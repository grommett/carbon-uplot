import { createAreaChart, CHART_RECREATED_EVENT } from '../dist/carbon-uplot.esm.js';
import {
  timestamps,
  cpuSeriesA,
  cpuSeriesB,
  cpuSeriesC,
  diskReads,
  diskWrites,
  diskAwait,
  memUsed,
  memCached,
  memBuffers,
} from './demo-data.js';

const cpuSeries = [{ label: 'prod-vsi-01' }, { label: 'prod-vsi-02' }, { label: 'prod-vsi-03' }];
const cpuData = [timestamps, cpuSeriesA, cpuSeriesB, cpuSeriesC];
const zoomCursor = { drag: { x: true, y: false, uni: 10 } };

const areaMulti = document.getElementById('area-multi');
const areaSingle = document.getElementById('area-single');
const areaLegendTop = document.getElementById('area-legend-top');
const areaNoLegend = document.getElementById('area-no-legend');
const areaColorOverride = document.getElementById('area-color-override');
const areaValueFormatter = document.getElementById('area-value-formatter');
const areaNoPoints = document.getElementById('area-no-points');

createAreaChart(areaMulti, {
  data: cpuData,
  yRange: [0, 100],
  series: cpuSeries,
  cursor: zoomCursor,
});

createAreaChart(areaSingle, {
  data: [timestamps, cpuSeriesC],
  yRange: [0, 100],
  series: [{ label: 'CPU' }],
  cursor: zoomCursor,
});

createAreaChart(areaLegendTop, {
  data: cpuData,
  yRange: [0, 100],
  series: cpuSeries,
  legend: 'top',
  cursor: zoomCursor,
});

createAreaChart(areaNoLegend, {
  data: cpuData,
  yRange: [0, 100],
  series: cpuSeries,
  legend: false,
  cursor: zoomCursor,
});

createAreaChart(areaColorOverride, {
  data: [timestamps, diskReads, diskWrites, diskAwait],
  yRange: [0, 350],
  series: [
    { label: 'reads/s', color: '#ff7eb6' },
    { label: 'writes/s', color: '#42be65' },
    { label: 'await (ms)', color: '#f1c21b' },
  ],
  cursor: zoomCursor,
});

createAreaChart(areaValueFormatter, {
  data: [timestamps, memUsed, memCached, memBuffers],
  series: [{ label: 'Used' }, { label: 'Cached' }, { label: 'Buffers' }],
  valueFormat: memoryValueFormat,
  xFormat: memoryXFormat,
  cursor: zoomCursor,
});

createAreaChart(areaNoPoints, {
  data: cpuData,
  yRange: [0, 100],
  series: cpuSeries.map((s) => ({ ...s, points: { show: false } })),
  cursor: zoomCursor,
});

buildInteractiveCharts();

/** Interactive charts */

function buildInteractiveCharts() {
  const main = document.getElementsByTagName('main')[0];
  const areaTogglePointsEl = document.getElementById('area-toggle-points');

  const registry = {
    'area-toggle-points': {
      el: areaTogglePointsEl,
      chart: buildTogglePointsChart(areaTogglePointsEl, true),
      state: { showPoints: true },
      handler: togglePointsHandler,
    },
  };

  Object.values(registry).forEach((entry) => {
    entry.el.addEventListener(CHART_RECREATED_EVENT, (event) => {
      registry[event.currentTarget.id].chart = event.detail.chart;
    });
  });

  main.addEventListener('click', (event) => {
    const entry = registry[event.target.dataset.id];
    if (!entry) return;
    entry.chart = entry.handler(entry);
  });
}

function togglePointsHandler({ chart, el, state }) {
  state.showPoints = !state.showPoints;
  el.style.height = `${el.clientHeight}px`;
  chart.destroy();
  const newChart = buildTogglePointsChart(el, state.showPoints);
  el.style.height = '';
  return newChart;
}

function buildTogglePointsChart(el, showPoints) {
  return createAreaChart(el, {
    data: cpuData,
    yRange: [0, 100],
    series: cpuSeries.map((s) => ({ ...s, points: { show: showPoints } })),
    cursor: zoomCursor,
  });
}

/** Helpers */

function memoryValueFormat(value) {
  return `${(value / 1024).toFixed(1)} GB`;
}

function memoryXFormat(timestamp) {
  return new Date(timestamp * 1000).toLocaleString(undefined, {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}
