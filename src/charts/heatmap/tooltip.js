import {
  TOOLTIP_STYLES,
  HEADER_STYLES,
  ROW_STYLES,
  VALUE_STYLES,
  ROW_CLASS,
  injectTooltipStyles,
} from '../../components/tooltip/tooltip-config.js';
import { formatX, formatValue } from '../../components/tooltip/tooltip.js';
import { MIN_CELL_ALPHA } from './config.js';

/**
 * Creates a uPlot plugin that renders a heatmap hover tooltip.
 *
 * Shows the bucket label, formatted timestamp, and count value for the cell
 * under the cursor. The row's left border mirrors the cell's heat color.
 *
 * @param {Array} data - uPlot data array [xValues, ...bucketSeries].
 * @param {string[]} bucketLabels - Y-axis labels, one per bucket.
 * @param {boolean} xTime - Whether x values are Unix timestamps.
 * @param {(count: number) => string} [valueFormat] - Custom count formatter.
 * @param {number[]} rgb - Resolved [r, g, b] for the heat color.
 * @param {number} maxVal - Global max count used for alpha normalization.
 * @returns {object} uPlot plugin object.
 */
export function buildHeatmapTooltip(data, bucketLabels, xTime, valueFormat, rgb, maxVal) {
  let tooltipEl;
  let headerEl;
  let rowEl;
  let bucketEl;
  let countEl;

  function init(u) {
    injectTooltipStyles();

    tooltipEl = document.createElement('div');
    headerEl = document.createElement('div');
    rowEl = document.createElement('div');
    bucketEl = document.createElement('span');
    countEl = document.createElement('span');

    Object.assign(tooltipEl.style, TOOLTIP_STYLES);
    Object.assign(headerEl.style, HEADER_STYLES);
    Object.assign(rowEl.style, ROW_STYLES);
    Object.assign(countEl.style, VALUE_STYLES);

    rowEl.className = ROW_CLASS;
    rowEl.appendChild(bucketEl);
    rowEl.appendChild(countEl);
    tooltipEl.appendChild(headerEl);
    tooltipEl.appendChild(rowEl);

    u.over.appendChild(tooltipEl);

    u.over.addEventListener('mouseleave', () => {
      tooltipEl.style.display = 'none';
    });
    u.over.addEventListener('mouseenter', () => {
      tooltipEl.style.display = null;
    });
  }

  function setCursor(u) {
    const { left, top, idx } = u.cursor;
    const numBuckets = data.length - 1;

    if (idx == null || left < 0) {
      tooltipEl.style.display = 'none';
      return;
    }

    const yVal = u.posToVal(top, 'y');
    const bucketIndex = Math.max(0, Math.min(Math.floor(yVal), numBuckets - 1));
    const count = data[bucketIndex + 1][idx];
    const norm = count != null ? count / maxVal : 0;
    const alpha = MIN_CELL_ALPHA + norm * (1 - MIN_CELL_ALPHA);
    const [red, green, blue] = rgb;

    headerEl.textContent = formatX(data[0][idx], xTime, null);
    bucketEl.textContent = bucketLabels ? (bucketLabels[bucketIndex] ?? `Row ${bucketIndex}`) : `Row ${bucketIndex}`;
    countEl.textContent = count == null ? '—' : formatValue(count, valueFormat);
    rowEl.style.borderLeft = `3px solid rgba(${red}, ${green}, ${blue}, ${alpha.toFixed(2)})`;

    const overRect = u.over.getBoundingClientRect();
    const tooltipWidth = tooltipEl.offsetWidth;
    const wouldOverflowRight = overRect.left + left + 16 + tooltipWidth > window.innerWidth;
    tooltipEl.style.display = null;
    tooltipEl.style.left = wouldOverflowRight ? `${left - 16 - tooltipWidth}px` : `${left + 16}px`;
    tooltipEl.style.top = `${top - 20}px`;
  }

  return { hooks: { init, setCursor } };
}
