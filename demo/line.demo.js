import { createLineChart } from '../dist/carbon-uplot.esm.js';
import {
  timestamps,
  cpuSeriesA,
  cpuSeriesB,
  cpuSeriesC,
  diskReads,
  diskWrites,
  diskAwait,
  netInbound,
  netOutbound,
} from './demo-data.js';

createLineChart(document.getElementById('line-multi'), {
  data: [timestamps, cpuSeriesA, cpuSeriesB, cpuSeriesC],
  yRange: [0, 100],
  series: [{ label: 'prod-vsi-01' }, { label: 'prod-vsi-02' }, { label: 'prod-vsi-03' }],
});

createLineChart(document.getElementById('line-single'), {
  data: [timestamps, cpuSeriesC],
  yRange: [0, 100],
  series: [{ label: 'CPU' }],
});

createLineChart(document.getElementById('line-legend-top'), {
  data: [timestamps, cpuSeriesA, cpuSeriesB, cpuSeriesC],
  yRange: [0, 100],
  series: [{ label: 'prod-vsi-01' }, { label: 'prod-vsi-02' }, { label: 'prod-vsi-03' }],
  legend: 'top',
});

createLineChart(document.getElementById('line-no-legend'), {
  data: [timestamps, cpuSeriesA, cpuSeriesB, cpuSeriesC],
  yRange: [0, 100],
  series: [{ label: 'prod-vsi-01' }, { label: 'prod-vsi-02' }, { label: 'prod-vsi-03' }],
  legend: false,
});

createLineChart(document.getElementById('line-color-override'), {
  data: [timestamps, diskReads, diskWrites, diskAwait],
  yRange: [0, 350],
  series: [
    { label: 'reads/s', color: '#ff7eb6' },
    { label: 'writes/s', color: '#42be65' },
    { label: 'await (ms)', color: '#f1c21b' },
  ],
});

createLineChart(document.getElementById('line-value-formatter'), {
  data: [timestamps, netInbound, netOutbound],
  series: [{ label: 'Inbound' }, { label: 'Outbound' }],
  valueFormat: function networkFormat(value) {
    if (value >= 1_048_576) return `${(value / 1_048_576).toFixed(1)} MB/s`;
    return `${(value / 1024).toFixed(0)} KB/s`;
  },
});
