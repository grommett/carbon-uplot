import { createGauge } from '../dist/carbon-uplot.esm.js';

createGauge(document.getElementById('gauge-cpu-info'), {
  value: 42,
  label: 'CPU utilization',
  valueFormat: (value) => `${value}%`,
});

createGauge(document.getElementById('gauge-purple'), {
  value: 57,
  ticks: false,
  valueFormat: (value) => `${value}%`,
  color: 'var(--cds-purple-60, #8a3ffc)',
});

createGauge(document.getElementById('gauge-disk-info'), {
  value: 1_840,
  min: 0,
  max: 4_096,
  label: 'Disk used',
  ticks: false,
  valueFormat: (value) => `${(value / 1024).toFixed(1)} TB`,
});

createGauge(document.getElementById('gauge-cpu-thresholds'), {
  value: 78,
  label: 'CPU utilization',
  valueFormat: (value) => `${value}%`,
  thresholds: [
    { value: 60, status: 'warning' },
    { value: 85, status: 'error' },
  ],
});

createGauge(document.getElementById('gauge-error-rate'), {
  value: 4.2,
  min: 0,
  max: 10,
  label: 'Error rate',
  valueFormat: (value) => `${value.toFixed(1)}%`,
  thresholds: [
    { value: 2, status: 'warning' },
    { value: 5, status: 'error' },
  ],
});

createGauge(document.getElementById('gauge-no-ticks'), {
  value: 63,
  label: 'CPU utilization',
  valueFormat: (value) => `${value}%`,
  ticks: false,
  thresholds: [
    { value: 60, status: 'warning' },
    { value: 85, status: 'error' },
  ],
});

createGauge(document.getElementById('gauge-mem-free-healthy'), {
  value: 68,
  label: 'Memory free',
  valueFormat: (value) => `${value}%`,
  thresholds: [
    { value: 0, status: 'error' },
    { value: 20, status: 'warning' },
    { value: 50, status: 'success' },
  ],
});

createGauge(document.getElementById('gauge-mem-free-low'), {
  value: 11,
  label: 'Memory free',
  valueFormat: (value) => `${value}%`,
  thresholds: [
    { value: 0, status: 'error' },
    { value: 20, status: 'warning' },
    { value: 50, status: 'success' },
  ],
});

createGauge(document.getElementById('gauge-p99'), {
  value: 480,
  min: 0,
  max: 1000,
  label: 'p99 latency',
  valueFormat: (value) => `${value}ms`,
  thresholds: [
    { value: 300, status: 'warning' },
    { value: 700, status: 'error' },
  ],
});

const liveGauge = createGauge(document.getElementById('gauge-live'), {
  value: 45,
  label: 'Memory free (live)',
  valueFormat: (value) => `${value}%`,
  thresholds: [
    { value: 0, status: 'error' },
    { value: 20, status: 'warning' },
    { value: 50, status: 'success' },
  ],
});

let liveValue = 45;
setInterval(() => {
  liveValue = Math.min(100, Math.max(0, liveValue + (Math.random() - 0.48) * 6));
  liveGauge.setValue({ value: Math.round(liveValue) });
}, 1000);
