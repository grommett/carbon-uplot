import { SERIES_COLORS } from '../../charts/chart-base.js';
import { CHART_RECREATED_EVENT } from '../../events.js';
import {
  HIDDEN_OPACITY,
  VISIBLE_OPACITY,
  LEGEND_STYLES,
  LEGEND_BOTTOM_STYLES,
  LEGEND_TOP_STYLES,
  ITEM_STYLES,
  SWATCH_STYLES,
  applyStyles,
} from './legend-config.js';

/**
 * Attaches an auto-generated legend to a chart unless legendOption is false or no series have labels.
 *
 * @param {uPlot} chart - The uPlot instance to control.
 * @param {{ label?: string }[]} series - Per-series config array.
 * @param {HTMLElement} mountEl - The chart mount element.
 * @param {boolean|"top"|"bottom"} legendOption - Legend placement or false to skip.
 */
export function attachLegend(chart, series, mountEl, legendOption) {
  if (legendOption === false) return;
  const labels = series.map((seriesItem) => seriesItem?.label);
  if (!labels.some(Boolean)) return;
  createLegend(chart, labels, mountEl, legendOption === 'top' ? 'top' : 'bottom');
}

/**
 * Creates a Carbon-styled legend, appends it relative to the chart mount element, and wires a per-item handleEvent
 * listener for click-to-toggle behavior.
 *
 * Series without a label are skipped; their index is still respected so toggle behavior remains correct for other
 * series.
 *
 * An AbortController ties all item listeners to the chart lifecycle — when the
 * chart is destroyed, every listener is removed in one abort() call.
 *
 * @param {uPlot} chart - The uPlot instance to control.
 * @param {(string | undefined)[]} labels - Label per series (aligned with series index).
 * @param {HTMLElement} mountEl - The chart mount element; legend is inserted relative to it.
 * @param {"bottom" | "top"} [placement] - Where to insert the legend relative to the chart. Defaults to "bottom".
 * @returns {HTMLElement} The created legend element.
 */
export function createLegend(chart, labels, mountEl, placement = 'bottom') {
  const colors = chart[SERIES_COLORS] ?? [];
  const legendEl = document.createElement('div');
  const itemHandlers = [];

  applyStyles(legendEl, LEGEND_STYLES);
  applyStyles(legendEl, placement === 'top' ? LEGEND_TOP_STYLES : LEGEND_BOTTOM_STYLES);

  labels.forEach((label, index) => {
    if (!label) return;
    const { item, handler } = createLegendItem(chart, label, index + 1, colors[index]);
    legendEl.appendChild(item);
    itemHandlers.push([item, handler]);
  });

  mountEl.insertAdjacentElement(placement === 'top' ? 'beforebegin' : 'afterend', legendEl);

  chart.hooks.destroy = chart.hooks.destroy ?? [];
  chart.hooks.destroy.push(() => {
    itemHandlers.forEach(([item, handler]) => item.removeEventListener('click', handler));
    legendEl.remove();
  });

  return legendEl;
}

/**
 * Maps each custom-legend item element to its handleEvent object so bindLegend
 * can update handler.chart on remount rather than removing and re-adding the listener.
 * WeakMap entries are released automatically when the element is garbage collected.
 */
const boundItemHandlers = new WeakMap();

/**
 * Wires a per-item handleEvent listener onto each child of a static legend element and syncs swatch colors from the
 * chart's resolved series colors.
 *
 * Each direct child of legendEl is treated as the legend item for the corresponding series — child[0] controls
 * series[1], child[1] series[2], etc. (series[0] is always the uPlot x-axis and is skipped.)
 *
 * Safe to call multiple times on the same legendEl (e.g. after a chart remount) — the browser
 * ignores duplicate addEventListener calls for the same object, and handler.chart is updated
 * in place so the handler always closes over the current chart instance.
 *
 * @param {uPlot} chart - The uPlot instance to control.
 * @param {HTMLElement} legendEl - Container whose direct children are legend items.
 */
export function bindLegend(chart, legendEl) {
  const colors = chart[SERIES_COLORS] ?? [];
  const chartEl = chart.root.parentElement;

  Array.from(legendEl.children).forEach((item, index) => {
    const seriesIndex = index + 1;
    const color = colors[index];
    const swatch = item.firstElementChild;
    let handler = boundItemHandlers.get(item);

    if (color && swatch) swatch.style.background = color;

    if (!handler) {
      handler = createItemHandler(seriesIndex);
      boundItemHandlers.set(item, handler);
      item.addEventListener('click', handler);
    }
    handler.chart = chart;
  });

  chartEl.addEventListener(
    CHART_RECREATED_EVENT,
    (event) => {
      bindLegend(event.detail.chart, legendEl);
    },
    { once: true },
  );
}

/**
 * Builds a single legend item element with a swatch and label.
 *
 * Returns both the element and its handler so the caller can remove the
 * listener explicitly when the chart is destroyed.
 *
 * @param {uPlot} chart
 * @param {string} label
 * @param {number} seriesIndex
 * @param {string} color
 * @returns {{ item: HTMLElement, handler: object }}
 */
function createLegendItem(chart, label, seriesIndex, color) {
  const item = document.createElement('button');
  const swatch = document.createElement('span');
  const handler = createItemHandler(seriesIndex);

  handler.chart = chart;
  if (color) swatch.style.background = color;
  applyStyles(item, ITEM_STYLES);
  applyStyles(swatch, SWATCH_STYLES);
  item.appendChild(swatch);
  item.appendChild(document.createTextNode(label));
  item.addEventListener('click', handler);

  return { item, handler };
}

/**
 * Returns a handleEvent listener object for a single legend item.
 *
 * chart is a mutable property rather than a closure variable so the same handler
 * object can be reused across chart remounts (bindLegend) without re-registering
 * the listener — the browser ignores duplicate addEventListener calls for the
 * same object, and updating handler.chart keeps it pointing at the live instance.
 *
 * @param {number} seriesIndex - 1-based series index.
 * @returns {{ chart: uPlot|null, handleEvent: (event: MouseEvent) => void }}
 */
function createItemHandler(seriesIndex) {
  return {
    chart: null,
    handleEvent(event) {
      const isVisible = this.chart.series[seriesIndex].show !== false;
      this.chart.setSeries(seriesIndex, { show: !isVisible });
      event.currentTarget.style.opacity = isVisible ? HIDDEN_OPACITY : VISIBLE_OPACITY;
    },
  };
}
