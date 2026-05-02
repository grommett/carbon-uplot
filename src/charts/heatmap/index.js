import { createChart, TRANSPARENT_SERIES, resolvePlugins } from '../chart-base.js';
import { createAxisConfig, PALETTE } from '../../theme/theme.js';
import { MIN_CELL_ALPHA } from './config.js';
import { buildHeatmapTooltip } from './tooltip.js';

/**
 * Creates a Carbon-styled heatmap chart.
 *
 * Data format mirrors uPlot: `[xValues, bucket0, bucket1, ...]`. Each bucket
 * is an array of counts/values aligned to xValues. Row 0 is the bottom bucket
 * (lowest value range), row n−1 is the top.
 *
 * Cell color is a single-hue sequential scale derived from `color`. Pass a hex
 * color for full alpha control; CSS custom properties fall back to Carbon blue.
 *
 * @param {HTMLElement} el - Mount target.
 * @param {object} config
 * @param {Array} config.data - uPlot data array [xValues, ...bucketSeries].
 * @param {string[]} [config.bucketLabels] - Y-axis labels, one per bucket. Index 0 = bottom row.
 * @param {string} [config.color] - Base hex color for the heat scale. Defaults to Carbon palette[0].
 * @param {boolean} [config.xTime] - Treat x values as Unix timestamps. Defaults to true.
 * @param {boolean} [config.tooltip] - Show hover tooltip. Defaults to true. Pass false to disable.
 * @param {(count: number) => string} [config.valueFormat] - Custom count formatter for the tooltip.
 * @returns {uPlot}
 */
export function createHeatmap(el, config) {
  const { data, bucketLabels, color, xTime = true, tooltip: tooltipOption = true, valueFormat, ...extraOptions } = config;
  const resolvedColor = color ?? PALETTE[0];
  const numBuckets = data.length - 1;
  const maxVal = computeMax(data);
  const rgb = parseHexRgb(resolvedColor);

  const heatmapPlugin = buildHeatmapPlugin(data, rgb, maxVal);
  const tooltipPlugin = tooltipOption !== false ? buildHeatmapTooltip(data, bucketLabels, xTime, valueFormat, rgb, maxVal) : null;
  const corePlugins = tooltipPlugin ? [heatmapPlugin, tooltipPlugin] : [heatmapPlugin];
  const { plugins, restOptions } = resolvePlugins(corePlugins, extraOptions);

  return createChart(
    el,
    {
      plugins,
      series: buildSeries(numBuckets),
      axes: [createAxisConfig(), buildYAxis(bucketLabels, numBuckets)],
      scales: {
        x: { time: xTime },
        y: { range: [0, numBuckets] },
      },
      cursor: { x: false, y: false },
      ...restOptions,
    },
    data,
    () => createHeatmap(el, config),
  );
}

function computeMax(data) {
  let max = 0;
  data.slice(1).forEach((bucket) => {
    bucket.forEach((val) => {
      if (val != null && val > max) max = val;
    });
  });
  return max || 1;
}

function parseHexRgb(hex) {
  if (!hex.startsWith('#')) return [69, 137, 255];
  const clean = hex.slice(1);
  const expanded = clean.length === 3
    ? clean.split('').map((char) => char + char).join('')
    : clean;
  return [
    parseInt(expanded.slice(0, 2), 16),
    parseInt(expanded.slice(2, 4), 16),
    parseInt(expanded.slice(4, 6), 16),
  ];
}

function buildSeries(numBuckets) {
  return [{}, ...Array.from({ length: numBuckets }, () => TRANSPARENT_SERIES)];
}

function buildYAxis(bucketLabels, numBuckets) {
  const splits = Array.from({ length: numBuckets }, (_, i) => i + 0.5);
  const values = (_, ticks) => ticks.map((_, i) => (bucketLabels ? (bucketLabels[i] ?? '') : String(i)));
  const size = (_, vals) => {
    if (!vals) return 40;
    return Math.max(...vals.map((val) => (val ? val.length : 0))) * 7 + 12;
  };
  return createAxisConfig({ splits: () => splits, values, size });
}

function buildHeatmapPlugin(data, rgb, maxVal) {
  const buckets = data.slice(1);

  function drawHeatmap(uplot) {
    const ctx = uplot.ctx;
    const [red, green, blue] = rgb;

    ctx.save();
    ctx.beginPath();
    ctx.rect(uplot.bbox.left, uplot.bbox.top, uplot.bbox.width, uplot.bbox.height);
    ctx.clip();

    data[0].forEach((xVal, col) => {
      const xLeft = Math.round(uplot.valToPos(xVal, 'x', true));
      const nextXVal = data[0][col + 1];
      const xRight = nextXVal !== undefined
        ? Math.round(uplot.valToPos(nextXVal, 'x', true))
        : Math.round(uplot.bbox.left + uplot.bbox.width);
      const cellW = Math.max(1, xRight - xLeft);

      buckets.forEach((bucket, row) => {
        const val = bucket[col];
        if (!val) return;

        const norm = val / maxVal;
        const alpha = MIN_CELL_ALPHA + norm * (1 - MIN_CELL_ALPHA);
        ctx.fillStyle = `rgba(${red}, ${green}, ${blue}, ${alpha.toFixed(2)})`;

        const yTop = Math.round(uplot.valToPos(row + 1, 'y', true));
        const yBottom = Math.round(uplot.valToPos(row, 'y', true));
        const cellH = Math.max(1, yBottom - yTop);

        ctx.fillRect(xLeft, yTop, cellW, cellH);
      });
    });

    ctx.restore();
  }

  return { hooks: { draw: [drawHeatmap] } };
}
