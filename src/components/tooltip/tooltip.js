import {
  TOOLTIP_STYLES,
  HEADER_STYLES,
  ROW_STYLES,
  VALUE_STYLES,
  ROW_CLASS,
  injectTooltipStyles,
} from './tooltip-config.js';

/**
 * Creates a uPlot plugin that renders a Carbon-styled tooltip panel.
 *
 * The panel follows the cursor with a fixed offset and flips to the left side
 * when near the right edge of the chart.
 *
 * @param {object} opts
 * @param {string[]} opts.colors - Resolved series colors, aligned by index.
 * @param {boolean} [opts.isTimeScale] - Whether the x axis holds Unix timestamps.
 * @param {(x: number) => string} [opts.xFormat] - Custom x-axis header formatter.
 * @param {(y: number) => string} [opts.valueFormat] - Custom series value formatter.
 * @returns {object} uPlot plugin object.
 */
export function createTooltipPlugin({ colors, isTimeScale = false, xFormat, valueFormat } = {}) {
  let tooltipEl;
  let headerEl;
  let rowEls;

  function init(u) {
    injectTooltipStyles();

    tooltipEl = document.createElement('div');
    headerEl = document.createElement('div');

    Object.assign(tooltipEl.style, TOOLTIP_STYLES);
    Object.assign(headerEl.style, HEADER_STYLES);
    tooltipEl.appendChild(headerEl);

    rowEls = u.series.slice(1).map((series, index) => {
      const color = colors[index];
      const row = document.createElement('div');
      const labelEl = document.createElement('span');
      const valueEl = document.createElement('span');

      row.className = ROW_CLASS;
      Object.assign(row.style, ROW_STYLES);
      row.style.borderLeft = `3px solid ${color}`;
      labelEl.textContent = series.label != null ? `${series.label} ` : `Series ${index + 1} `;
      Object.assign(valueEl.style, VALUE_STYLES);

      row.appendChild(labelEl);
      row.appendChild(valueEl);
      tooltipEl.appendChild(row);

      return { row, valueEl, seriesIndex: index + 1 };
    });

    tooltipEl.style.bottom = '8px';

    u.over.appendChild(tooltipEl);

    u.over.addEventListener('mouseleave', () => {
      tooltipEl.style.display = 'none';
    });
    u.over.addEventListener('mouseenter', () => {
      tooltipEl.style.display = null;
    });
  }

  function setCursor(u) {
    const { left, idx } = u.cursor;
    const overRect = u.over.getBoundingClientRect();
    const tooltipWidth = tooltipEl.offsetWidth;
    const wouldOverflowRight = overRect.left + left + 16 + tooltipWidth > window.innerWidth;

    if (idx == null || left < 0) {
      tooltipEl.style.display = 'none';
      return;
    }

    tooltipEl.style.display = null;
    headerEl.textContent = formatX(u.data[0][idx], isTimeScale, xFormat);

    rowEls.forEach(({ row, valueEl, seriesIndex }) => {
      const series = u.series[seriesIndex];
      const yVal = u.data[seriesIndex][idx];

      if (!series?.show) {
        row.style.display = 'none';
        return;
      }

      row.style.display = null;
      valueEl.textContent = yVal == null ? '—' : formatValue(yVal, valueFormat);
    });

    tooltipEl.style.left = wouldOverflowRight ? `${left - 16 - tooltipWidth}px` : `${left + 16}px`;
  }

  return { hooks: { init, setCursor } };
}

export function formatX(x, isTimeScale, xFormat) {
  if (xFormat) return xFormat(x);
  if (isTimeScale) {
    const date = new Date(x * 1000);
    const pad = (n) => String(n).padStart(2, '0');
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}`;
  }
  return String(x);
}

export function formatValue(value, valueFormat) {
  if (valueFormat) return valueFormat(value);
  return value.toLocaleString();
}
