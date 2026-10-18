import { createBarChart } from '../dist/carbon-uplot.esm.js';
import { dailyTimestamps, dailyRequests, dailyRequestsB, dailyRequestsC, dailyErrors, dailyP99 } from './demo-data.js';

createBarChart(document.getElementById('bar-single'), {
  data: [dailyTimestamps, dailyRequests],
  series: [{ label: 'Requests' }],
  valueFormat: (value) => value.toLocaleString(),
});

createBarChart(document.getElementById('bar-x-format'), {
  data: [dailyTimestamps, dailyErrors],
  series: [{ label: 'Errors' }],
  xFormat: dayLabel,
  valueFormat: (value) => value.toLocaleString(),
});

createBarChart(document.getElementById('bar-value-format'), {
  data: [dailyTimestamps, dailyP99],
  series: [{ label: 'p99 latency' }],
  valueFormat: (value) => `${value.toFixed(0)} ms`,
});

createBarChart(document.getElementById('bar-colors'), {
  data: [dailyTimestamps, dailyRequests, dailyRequestsB, dailyRequestsC],
  series: [
    { label: 'us-east', color: '#4589ff' },
    { label: 'us-south', color: '#ff7eb6' },
    { label: 'eu-de', color: '#42be65' },
  ],
  valueFormat: (value) => value.toLocaleString(),
  legend: 'top',
});

function dayLabel(timestamp) {
  return new Date(timestamp * 1000).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}