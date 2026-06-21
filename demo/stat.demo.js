import { createStat } from '../dist/carbon-uplot.esm.js';
import { timestamps, cpuSeriesA, cpuSeriesB, memUsed, netInbound } from './demo-data.js';

createStat(document.getElementById('stat-cpu'), {
  value: cpuSeriesA.at(-1),
  data: [timestamps, cpuSeriesA],
  label: 'CPU utilization',
  valueFormat: (value) => `${value.toFixed(0)}%`,
});

createStat(document.getElementById('stat-memory'), {
  value: memUsed.at(-1),
  data: [timestamps, memUsed],
  label: 'Memory used',
  color: '#be95ff',
  valueFormat: formatGigabytes,
});

createStat(document.getElementById('stat-network'), {
  value: netInbound.at(-1),
  data: [timestamps, netInbound],
  label: 'Network in',
  color: '#42be65',
  valueFormat: formatNetworkRate,
});

createStat(document.getElementById('stat-sparkline-only'), {
  value: cpuSeriesB.at(-1),
  data: [timestamps, cpuSeriesB],
  showValue: false,
  color: '#3ddbd9',
});

createStat(document.getElementById('stat-value-only'), {
  value: 99.97,
  label: 'Uptime',
  sparkline: false,
  valueFormat: (value) => `${value}%`,
});

const liveStat = createStat(document.getElementById('stat-live'), {
  value: 45,
  data: [timestamps, cpuSeriesA],
  label: 'CPU utilization (live)',
  color: '#ff832b',
  valueFormat: (value) => `${value.toFixed(0)}%`,
});

let liveValue = 45;
setInterval(() => {
  liveValue = Math.min(100, Math.max(0, liveValue + (Math.random() - 0.48) * 6));
  liveStat.setValue({ value: Math.round(liveValue) });
}, 500);

createStat(document.getElementById('stat-sm'), {
  value: cpuSeriesA.at(-1),
  data: [timestamps, cpuSeriesA],
  label: 'CPU utilization',
  size: 'sm',
  valueFormat: (value) => `${value.toFixed(0)}%`,
});

createStat(document.getElementById('stat-lg'), {
  value: 99.97,
  label: 'Uptime',
  sparkline: false,
  size: 'lg',
  align: 'center',
  verticalAlign: 'center',
  valueFormat: (value) => `${value}%`,
});

createStat(document.getElementById('stat-center'), {
  value: memUsed.at(-1),
  data: [timestamps, memUsed],
  label: 'Memory used',
  color: '#be95ff',
  align: 'center',
  valueFormat: formatGigabytes,
});

createStat(document.getElementById('stat-right'), {
  value: netInbound.at(-1),
  data: [timestamps, netInbound],
  label: 'Network in',
  color: '#42be65',
  align: 'right',
  valueFormat: formatNetworkRate,
});

function formatGigabytes(bytes) {
  return `${(bytes / 1024).toFixed(1)} GB`;
}

function formatNetworkRate(bytes) {
  if (bytes >= 1_048_576) return `${(bytes / 1_048_576).toFixed(1)} MB/s`;
  return `${(bytes / 1024).toFixed(0)} KB/s`;
}
