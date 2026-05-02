import uPlot from 'uplot';
import { PALETTE } from '../theme/theme.js';
import { onThemeChange } from '../theme/themes.js';
import { CHART_RECREATED_EVENT } from '../events.js';

/**
 * Symbol key used to attach resolved series colors to a chart instance. Read by bindLegend to sync swatch colors
 * without polluting the uPlot namespace.
 */
export const SERIES_COLORS = Symbol('carbonSeriesColors');

/** Transparent series config used by chart types that draw custom paths via plugins. */
export const TRANSPARENT_SERIES = {
  stroke: 'transparent',
  fill: 'transparent',
  paths: () => null,
};

/**
 * Resolves the color for each series, falling back to the Carbon palette when no color is provided.
 *
 * @param {number} count - Number of series (excluding the x series).
 * @param {{ color?: string }[]} series - Per-series config array.
 * @returns {string[]}
 */
export function resolveSeriesColors(count, series) {
  return Array.from({ length: count }, (_, index) => (series[index] ?? {}).color ?? PALETTE[index % PALETTE.length]);
}

/**
 * Merges library-owned core plugins with any extra plugins passed in via extraOptions, and splits the remaining
 * options out for spreading onto the chart config.
 *
 * @param {object[]} corePlugins - Plugins created by the chart factory (e.g. tooltip).
 * @param {object} extraOptions - Raw extra options from the caller; may contain a plugins array.
 * @returns {{ plugins: object[], restOptions: object }}
 */
export function resolvePlugins(corePlugins, extraOptions) {
  const { plugins: extraPlugins = [], ...restOptions } = extraOptions;
  return { plugins: [...corePlugins, ...extraPlugins], restOptions };
}

/**
 * Creates a uPlot instance sized to fit its container element.
 *
 * @param {HTMLElement} el - Mount target (must have a real rendered width).
 * @param {object} options - Partial uPlot options merged with base config.
 * @param {Array} data - uPlot data array [xValues, ...ySeries].
 * @returns {uPlot}
 */
export function createChart(el, options, data, factory) {
  const width = el.getBoundingClientRect().width || el.clientWidth || 300;
  const height = el.clientHeight || 170;

  const chart = new uPlot(
    {
      width,
      height,
      background: 'transparent',
      padding: [8, 8, 0, 0],
      legend: { show: false },
      cursor: { show: true, drag: { x: true, y: false, uni: 10 } },
      ...options,
    },
    data,
    el,
  );

  const observer = new ResizeObserver((entries) => {
    const newWidth = entries[0]?.contentRect.width;
    if (newWidth > 0) chart.setSize({ width: newWidth, height: el.clientHeight });
  });

  observer.observe(el);

  const originalDestroy = chart.destroy.bind(chart);
  let unsubscribe = null;

  if (factory) {
    unsubscribe = onThemeChange(() => {
      observer.disconnect();
      unsubscribe();
      originalDestroy();
      const newChart = factory(el);
      if (newChart) {
        el.dispatchEvent(new CustomEvent(CHART_RECREATED_EVENT, { detail: { chart: newChart } }));
      }
    });
  }

  chart.destroy = () => {
    observer.disconnect();
    if (unsubscribe) unsubscribe();
    originalDestroy();
  };

  return chart;
}
