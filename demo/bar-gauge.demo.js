import { createBarGauge } from '../dist/carbon-uplot.esm.js';
import { BAR_GAUGE_CPU, BAR_GAUGE_DISK, BAR_GAUGE_AVAILABILITY } from './demo-data.js';

const CPU_THRESHOLDS = [
  { value: 70, status: 'warning' },
  { value: 85, status: 'error' },
];

const AVAILABILITY_THRESHOLDS = [
  { value: 80, status: 'error' },
  { value: 95, status: 'warning' },
];

createBarGauge(document.getElementById('bar-gauge-default'), {
  series: BAR_GAUGE_CPU,
  valueFormat: (v) => `${v}%`,
});

createBarGauge(document.getElementById('bar-gauge-cpu'), {
  series: BAR_GAUGE_CPU,
  thresholds: CPU_THRESHOLDS,
  valueFormat: (v) => `${v}%`,
});

createBarGauge(document.getElementById('bar-gauge-cpu-thresholds'), {
  series: BAR_GAUGE_AVAILABILITY,
  thresholds: AVAILABILITY_THRESHOLDS,
  inverted: true,
  valueFormat: (v) => `${v.toFixed(1)}%`,
});

createBarGauge(document.getElementById('bar-gauge-disk'), {
  series: BAR_GAUGE_DISK,
  max: 500,
  color: '#3ddbd9',
  valueFormat: (v) => `${v} GB`,
});

createBarGauge(document.getElementById('bar-gauge-single'), {
  series: [{ label: 'Heap used', value: 430 }],
  max: 512,
  valueFormat: (v) => `${v} MB`,
});
