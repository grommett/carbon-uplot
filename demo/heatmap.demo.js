import { createHeatmap } from '../dist/carbon-uplot.esm.js';
import { heatmapData, HEATMAP_BUCKET_LABELS } from './demo-data.js';

createHeatmap(document.getElementById('heatmap-latency'), {
  data: heatmapData,
  bucketLabels: HEATMAP_BUCKET_LABELS,
});

createHeatmap(document.getElementById('heatmap-teal'), {
  data: heatmapData,
  bucketLabels: HEATMAP_BUCKET_LABELS,
  color: '#3ddbd9',
});
