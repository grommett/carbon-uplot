import { createChart, resolveSeriesColors, resolvePlugins, TRANSPARENT_SERIES, SERIES_COLORS } from './chart-base.js';
import { attachLegend } from '../components/legend/legend.js';
import { createAxisConfig } from '../theme/theme.js';
import { FONT_SANS } from '../theme/fonts.js';

const SCATTER_DOT_RADIUS = 3.5;
const FILL_ALPHA_HEX = 'cc';
const LABEL_FONT = `11px ${FONT_SANS}`;

/**
 * Creates a uPlot scatter chart.
 *
 * @param {HTMLElement} el - Mount target.
 * @param {object} config
 * @param {Array} config.data - UPlot data [xIndexes, ...ySeries].
 * @param {[number, number]} config.xRange - [min, max] for the x scale.
 * @param {[number, number]} config.yRange - [min, max] for the y scale.
 * @param {{ color?: string; label?: string }[]} [config.series] - Per-series overrides. Defaults to Carbon palette colors.
 * @param {string} [config.xLabel] - Label for the x axis.
 * @param {string} [config.yLabel] - Label for the y axis.
 * @param {boolean | "top" | "bottom"} [config.legend] - Legend placement. Defaults to "bottom". Pass false to disable.
 * @returns {uPlot}
 */
export function createScatterChart(el, config) {
  const { series = [], data, xRange, yRange, xLabel, yLabel, legend: legendOption = true, ...extraOptions } = config;
  const seriesCount = data.length - 1;
  const resolvedColors = resolveSeriesColors(seriesCount, series);
  const { plugins, restOptions } = resolvePlugins([createScatterPlugin(resolvedColors)], extraOptions);

  const chart = createChart(
    el,
    {
      axes: [
        createAxisConfig({ label: xLabel, labelFont: LABEL_FONT }),
        createAxisConfig({ label: yLabel, labelFont: LABEL_FONT }),
      ],
      plugins,
      series: buildScatterSeries(seriesCount),
      scales: {
        x: { time: false, range: xRange },
        y: { range: yRange },
      },
      ...restOptions,
    },
    data,
    () => createScatterChart(el, config),
  );

  chart[SERIES_COLORS] = resolvedColors;
  attachLegend(chart, series, el, legendOption);

  return chart;
}

function buildScatterSeries(seriesCount) {
  return [{}, ...Array.from({ length: seriesCount }, () => TRANSPARENT_SERIES)];
}

function createScatterPlugin(colors) {
  return {
    hooks: {
      drawSeries: [drawScatterSeries.bind(null, colors)],
    },
  };
}

/**
 * DrawSeries hook that renders filled circles for a scatter series. data[0] holds x-axis index values; data[n] holds y
 * values per series.
 *
 * @param {string[]} colors - One color per series (index 0 = series 1, etc.).
 * @param {uPlot} uplot - The uPlot instance.
 * @param {number} seriesIndex - 1-based series index supplied by uPlot.
 */
function drawScatterSeries(colors, uplot, seriesIndex) {
  const ctx = uplot.ctx;
  const color = colors[seriesIndex - 1] + FILL_ALPHA_HEX;

  ctx.save();
  ctx.fillStyle = color;

  uplot.data[seriesIndex].forEach((yValue, index) => {
    ctx.beginPath();
    ctx.arc(
      uplot.valToPos(uplot.data[0][index], 'x', true),
      uplot.valToPos(yValue, 'y', true),
      SCATTER_DOT_RADIUS,
      0,
      Math.PI * 2,
    );
    ctx.fill();
  });

  ctx.restore();
}
