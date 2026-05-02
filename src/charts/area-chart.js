import { createChart, resolveSeriesColors, resolvePlugins, SERIES_COLORS } from './chart-base.js';
import { attachLegend } from '../components/legend/legend.js';
import { createTooltipPlugin } from '../components/tooltip/tooltip.js';
import { createAxisConfig } from '../theme/theme.js';

/** Hex alpha suffix that gives fills a subtle 16% opacity. */
const FILL_ALPHA_HEX = '28';

/**
 * Creates a uPlot area chart with semi-transparent fills.
 *
 * @param {HTMLElement} el - Mount target.
 * @param {object} config
 * @param {Array} config.data - uPlot data array [timestamps, ...ySeries].
 * @param {[number, number]} config.yRange - [min, max] for the y scale.
 * @param {{ color?: string; width?: number; label?: string }[]} [config.series] - Per-series overrides.
 * @param {boolean|"top"|"bottom"} [config.legend] - Legend placement. Defaults to "bottom". Pass false to disable.
 * @param {boolean} [config.tooltip] - Show tooltip. Defaults to true. Pass false to disable.
 * @param {(y: number) => string} [config.valueFormat] - Custom value formatter for tooltip.
 * @returns {uPlot}
 */
export function createAreaChart(el, config) {
  const {
    series = [],
    data,
    yRange,
    legend: legendOption = true,
    tooltip: tooltipOption = true,
    valueFormat,
    xFormat,
    ...extraOptions
  } = config;
  const seriesCount = data.length - 1;
  const resolvedColors = resolveSeriesColors(seriesCount, series);
  const { plugins, restOptions } = resolvePlugins(
    getCorePlugins(resolvedColors, tooltipOption, valueFormat, xFormat),
    extraOptions,
  );

  const chart = createChart(
    el,
    {
      axes: [createAxisConfig(), createAxisConfig()],
      plugins,
      series: buildAreaSeries(resolvedColors, series),
      scales: {
        x: { time: true },
        y: { range: yRange },
      },
      ...restOptions,
    },
    data,
    () => createAreaChart(el, config),
  );

  chart[SERIES_COLORS] = resolvedColors;
  attachLegend(chart, series, el, legendOption);

  return chart;
}

function getCorePlugins(resolvedColors, tooltipOption, valueFormat, xFormat) {
  return tooltipOption !== false
    ? [createTooltipPlugin({ colors: resolvedColors, isTimeScale: true, valueFormat, xFormat })]
    : [];
}

function buildAreaSeries(resolvedColors, series) {
  return [
    {},
    ...resolvedColors.map((color, index) => {
      const { label, width, color: _color, ...rest } = series[index] ?? {};
      return {
        label,
        stroke: color,
        fill: color + FILL_ALPHA_HEX,
        width: width ?? 2,
        ...rest,
      };
    }),
  ];
}
