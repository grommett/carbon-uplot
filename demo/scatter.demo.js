import { createScatterChart } from '../dist/carbon-uplot.esm.js';
import { scatterCpu, scatterLatency, scatterLatencyB, scatterLatencyC } from './demo-data.js';

createScatterChart(document.getElementById('scatter-single'), {
  data: [scatterCpu, scatterLatency],
  series: [{ label: 'prod-vsi-01' }],
});

createScatterChart(document.getElementById('scatter-labels'), {
  data: [scatterCpu, scatterLatency],
  series: [{ label: 'prod-vsi-01' }],
  xLabel: 'CPU utilization (%)',
  yLabel: 'Response time (ms)',
});

createScatterChart(document.getElementById('scatter-multi'), {
  data: [scatterCpu, scatterLatency, scatterLatencyB, scatterLatencyC],
  series: [{ label: 'web tier' }, { label: 'app tier' }, { label: 'db tier' }],
  xLabel: 'CPU utilization (%)',
  yLabel: 'Response time (ms)',
});

createScatterChart(document.getElementById('scatter-colors'), {
  data: [scatterCpu, scatterLatency, scatterLatencyB, scatterLatencyC],
  series: [
    { label: 'web tier', color: '#4589ff' },
    { label: 'app tier', color: '#ff7eb6' },
    { label: 'db tier', color: '#42be65' },
  ],
  xLabel: 'CPU utilization (%)',
  yLabel: 'Response time (ms)',
  legend: 'top',
});
