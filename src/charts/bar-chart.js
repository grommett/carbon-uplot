import uPlot from 'uplot';
import { createChart, resolveSeriesColors, resolvePlugins, SERIES_COLORS } from './chart-base.js';
import { attachLegend } from '../components/legend/legend.js';
import { createTooltipPlugin } from '../components/tooltip/tooltip.js';
import { createAxisConfig } from '../theme/theme.js';

/**
 * Creates a uPlot bar chart.
 *
 * @param {HTMLElement} el - Mount target.
 * @param {object} config
 * @param {Array} config.data - uPlot data array [xValues, ...ySeries].
 * @param {[number, number]} config.yRange - [min, max] for the y scale.
 * @param {{ color?: string; label?: string }[]} [config.series] - Per-series overrides. Defaults to Carbon palette colors.
 * @param {Function} [config.xFormat] - Optional x-axis label formatter. Also used as the tooltip header formatter.
 * @param {boolean|"top"|"bottom"} [config.legend] - Legend placement. Defaults to "bottom". Pass false to disable.
 * @param {boolean} [config.tooltip] - Show tooltip. Defaults to true. Pass false to disable.
 * @param {(y: number) => string} [config.valueFormat] - Custom value formatter for tooltip.
 * @returns {uPlot}
 */
export function createBarChart(el, config) {
  const {
    series = [],
    data,
    yRange,
    xFormat,
    legend: legendOption = true,
    tooltip: tooltipOption = true,
    valueFormat,
    ...extraOptions
  } = config;
  const seriesCount = data.length - 1;
  const resolvedColors = resolveSeriesColors(seriesCount, series);
  const { plugins, restOptions } = resolvePlugins(
    getCorePlugins(resolvedColors, tooltipOption, xFormat, valueFormat),
    extraOptions,
  );

  const chart = createChart(
    el,
    {
      axes: [buildXAxisConfig(xFormat), buildYAxisConfig(valueFormat)],
      plugins,
      series: buildBarSeries(resolvedColors, series),
      scales: {
        x: { time: true, range: buildXRange(data) },
        y: { range: yRange },
      },
      ...restOptions,
    },
    data,
    () => createBarChart(el, config),
  );

  chart[SERIES_COLORS] = resolvedColors;
  attachLegend(chart, series, el, legendOption);

  return chart;
}

function getCorePlugins(resolvedColors, tooltipOption, xFormat, valueFormat) {
  return tooltipOption !== false
    ? [createTooltipPlugin({ colors: resolvedColors, isTimeScale: true, xFormat, valueFormat })]
    : [];
}

function buildXAxisConfig(xFormat) {
  return createAxisConfig({
    values: xFormat ? (_uplot, timestamps) => timestamps.map(xFormat) : undefined,
  });
}

function buildYAxisConfig(valueFormat) {
  if (!valueFormat) return createAxisConfig();
  return createAxisConfig({
    values: (_, ticks) => ticks.map((tick) => (tick == null ? '' : valueFormat(tick))),
    size: (self, values) => (values ? Math.max(...values.map((value) => value.length)) * 7 + 12 : 40),
  });
}

function buildXRange(data) {
  return (_uplot, min, max) => {
    const barCount = data[0].length;
    const pad = (max - min) / (barCount - 1) / 2;
    if (barCount <= 1) return [min, max];
    return [min - pad, max + pad];
  };
}

function buildBarSeries(resolvedColors, series) {
  return [
    {},
    ...resolvedColors.map((color, index) => ({
      label: series[index]?.label,
      fill: color,
      width: 0,
      paths: uPlot.paths.bars({ size: [0.6, 18, 1] }),
      points: (series[index] ?? {}).points ?? { show: false },
    })),
  ];
}
