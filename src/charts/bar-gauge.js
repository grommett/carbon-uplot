import { FONT_SANS, FONT_MONO } from '../theme/fonts.js';
import { CU_INTERACTIVE, CU_SUPPORT_SUCCESS, CU_BORDER_SUBTLE, CU_TEXT_PRIMARY, cuSupport } from '../theme/vars.js';

const BAR_HEIGHT = 8;

/**
 * Creates a Carbon-styled bar gauge — a vertical list of labeled horizontal bars.
 *
 * Each series item is rendered as one row: label left, bar center, value right.
 * Passing a single-item series is equivalent to a standalone meter.
 *
 * @param {HTMLElement} containerEl - Element to mount into.
 * @param {object} [config]
 * @param {{ label?: string; value?: number; color?: string; status?: string }[]} [config.series] - Rows to render.
 * @param {number} [config.min] - Minimum scale value. Defaults to 0.
 * @param {number} [config.max] - Maximum scale value. Defaults to 100.
 * @param {string} [config.color] - Global bar color. Overridden per-series by series[i].color or thresholds.
 * @param {{ value: number; status: string }[]} [config.thresholds] - Color thresholds sorted ascending by value.
 * @param {(value: number) => string} [config.valueFormat] - Custom value formatter for the right-hand label.
 * @returns {{ setValue: (index: number, update: { value: number; status?: string }) => void }}
 */
export function createBarGauge(containerEl, { series = [], min = 0, max = 100, color, thresholds = [], inverted = false, valueFormat } = {}) {
  const wrapper = buildWrapper();
  const rows = series.map(initRow);
  containerEl.appendChild(wrapper);

  function initRow(item, index) {
    const row = buildBarRow(wrapper, item, min, max);
    const initialValue = item.value ?? 0;
    updateRow(row, index, initialValue, item.status);
    return row;
  }

  function updateRow(row, index, value, statusOverride) {
    const ratio = Math.max(0, Math.min((value - min) / (max - min), 1));
    const resolvedColor = resolveBarColor(value, series[index], color, thresholds, statusOverride, inverted);
    row.fillEl.style.width = `${ratio * 100}%`;
    row.fillEl.style.background = resolvedColor;
    row.valueEl.textContent = valueFormat ? valueFormat(value) : value.toLocaleString();
    row.trackEl.setAttribute('aria-valuenow', value);
  }

  function setValue(index, { value, status } = {}) {
    const row = rows[index];
    if (!row) return;
    updateRow(row, index, value, status);
  }

  return { setValue };
}

function buildWrapper() {
  const el = document.createElement('div');
  Object.assign(el.style, {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
    padding: '1rem',
    width: '100%',
    boxSizing: 'border-box',
  });
  return el;
}

function buildBarRow(wrapper, item, min, max) {
  const rowEl = document.createElement('div');
  const labelEl = document.createElement('span');
  const trackEl = document.createElement('div');
  const fillEl = document.createElement('div');
  const valueEl = document.createElement('span');

  Object.assign(rowEl.style, {
    display: 'grid',
    gridTemplateColumns: 'minmax(0, max-content) 1fr max-content',
    alignItems: 'center',
    gap: '12px',
  });

  Object.assign(labelEl.style, {
    fontSize: '12px',
    fontFamily: FONT_SANS,
    color: CU_TEXT_PRIMARY,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    maxWidth: '140px',
  });

  Object.assign(trackEl.style, {
    height: `${BAR_HEIGHT}px`,
    background: CU_BORDER_SUBTLE,
    borderRadius: '2px',
    overflow: 'hidden',
  });

  Object.assign(fillEl.style, {
    height: '100%',
    borderRadius: '2px',
    transition: 'width 0.2s ease, background 0.2s ease',
  });

  Object.assign(valueEl.style, {
    fontSize: '11px',
    fontFamily: FONT_MONO,
    color: CU_TEXT_PRIMARY,
    minWidth: '40px',
    textAlign: 'right',
    whiteSpace: 'nowrap',
  });

  labelEl.title = item.label ?? '';
  labelEl.textContent = item.label ?? '';

  trackEl.setAttribute('role', 'meter');
  trackEl.setAttribute('aria-label', item.label ?? '');
  trackEl.setAttribute('aria-valuemin', min);
  trackEl.setAttribute('aria-valuemax', max);

  trackEl.appendChild(fillEl);
  rowEl.appendChild(labelEl);
  rowEl.appendChild(trackEl);
  rowEl.appendChild(valueEl);
  wrapper.appendChild(rowEl);

  return { fillEl, valueEl, trackEl };
}

function resolveBarColor(value, seriesItem, globalColor, thresholds, statusOverride, inverted) {
  const status = statusOverride ?? seriesItem?.status;
  if (seriesItem?.color) return seriesItem.color;
  if (globalColor) return globalColor;
  if (status === 'good') return CU_SUPPORT_SUCCESS;
  if (status) return cuSupport(status);
  if (!thresholds.length) return CU_INTERACTIVE;
  
  return inverted ? colorFromInvertedThresholds(value, thresholds) : colorFromThresholds(value, thresholds);
}

function colorFromThresholds(value, thresholds) {
  const matched = thresholds.reduce((best, threshold) => {
    return value >= threshold.value ? threshold : best;
  }, null);
  return matched ? cuSupport(matched.status) : CU_SUPPORT_SUCCESS;
}

function colorFromInvertedThresholds(value, thresholds) {
  const matched = thresholds.find((threshold) => value < threshold.value) ?? null;
  return matched ? cuSupport(matched.status) : CU_SUPPORT_SUCCESS;
}
