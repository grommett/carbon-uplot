import { createChart } from './chart-base.js';
import { PALETTE } from '../theme/theme.js';
import { FONT_SANS } from '../theme/fonts.js';
import { CU_TEXT_SECONDARY } from '../theme/vars.js';

/** Hex alpha suffix for sparkline fill — matches area chart opacity. */
const FILL_ALPHA_HEX = '28';

/** Fallback sparkline height when the container has no intrinsic height. */
const SPARK_HEIGHT = 64;

const VALUE_FONT_SIZE = { sm: '1.25rem', md: '2.5rem', lg: '5rem' };

/**
 * Creates a Carbon-styled stat panel with an optional big-number value and sparkline.
 *
 * Pass `showValue: false` to render only the sparkline (Grafana sparkline-only mode).
 * Pass `sparkline: false` to render only the value.
 *
 * @param {HTMLElement} containerEl - Element to mount into.
 * @param {object} [config]
 * @param {number} [config.value] - Initial value to display. Defaults to 0.
 * @param {Array} [config.data] - uPlot data array [xValues, yValues] for the sparkline.
 * @param {string} [config.label] - Descriptive label rendered below the value.
 * @param {(value: number) => string} [config.valueFormat] - Custom formatter for the displayed value.
 * @param {boolean} [config.showValue] - Whether to render the big number. Defaults to true.
 * @param {boolean} [config.sparkline] - Whether to render the sparkline. Defaults to true.
 * @param {string} [config.color] - Color for the value text and sparkline. Defaults to Carbon palette[0].
 * @param {'sm'|'md'|'lg'} [config.size] - Value font size. Defaults to 'md'.
 * @param {'left'|'center'|'right'} [config.align] - Horizontal alignment of value and label. Defaults to 'left'.
 * @param {'top'|'center'} [config.verticalAlign] - Vertical alignment within the container. Defaults to 'top'.
 * @returns {{ setValue: (update: { value: number }) => void }}
 */
export function createStat(
  containerEl,
  {
    value: initialValue = 0,
    data,
    label,
    valueFormat,
    showValue = true,
    sparkline: showSparkline = true,
    color,
    size = 'md',
    align = 'left',
    verticalAlign = 'top',
  } = {},
) {
  const resolvedColor = color ?? PALETTE[0];
  const wrapper = buildWrapper(verticalAlign);
  containerEl.appendChild(wrapper);

  const valueEl = showValue ? buildValueArea(wrapper, resolvedColor, label, size, align) : null;

  let sparkData = data ? [data[0].slice(), data[1].slice()] : null;
  const sparkStep = sparkData && sparkData[0].length > 1
    ? sparkData[0].at(-1) - sparkData[0].at(-2)
    : 1;
  let uplot = null;

  if (showSparkline && sparkData) {
    const sparkEl = buildSparklineContainer(wrapper);
    uplot = mountSparkline(sparkEl, sparkData, resolvedColor);
  }

  if (valueEl) {
    valueEl.textContent = valueFormat ? valueFormat(initialValue) : initialValue;
  }

  function setValue({ value } = {}) {
    if (valueEl) {
      valueEl.textContent = valueFormat ? valueFormat(value) : value;
    }
    if (uplot && sparkData) {
      sparkData[0].push(sparkData[0].at(-1) + sparkStep);
      sparkData[1].push(value);
      sparkData[0].shift();
      sparkData[1].shift();
      uplot.setData(sparkData);
    }
  }

  return { setValue };
}

/** Builds the outer flex wrapper. */
function buildWrapper(verticalAlign) {
  const el = document.createElement('div');
  Object.assign(el.style, {
    display: 'flex',
    flexDirection: 'column',
    width: '100%',
    height: '100%',
    overflow: 'hidden',
    justifyContent: verticalAlign === 'center' ? 'center' : 'flex-start',
  });
  return el;
}

/**
 * Builds the value + optional label area, appends it to the wrapper, and returns the
 * value element so setValue can update its textContent.
 */
function buildValueArea(wrapperEl, color, label, size, align) {
  const area = document.createElement('div');
  const valueEl = document.createElement('div');

  Object.assign(area.style, {
    padding: '1rem 1rem 0.5rem',
    display: 'flex',
    flexDirection: 'column',
    gap: '0.25rem',
  });

  Object.assign(valueEl.style, {
    fontSize: VALUE_FONT_SIZE[size],
    fontWeight: '300',
    lineHeight: '1',
    fontFamily: FONT_SANS,
    color,
    textAlign: align,
  });

  area.appendChild(valueEl);

  if (label) {
    const labelEl = document.createElement('div');
    Object.assign(labelEl.style, {
      fontSize: '0.75rem',
      fontFamily: FONT_SANS,
      color: CU_TEXT_SECONDARY,
      textAlign: align,
    });
    labelEl.textContent = label;
    area.appendChild(labelEl);
  }

  wrapperEl.appendChild(area);
  return valueEl;
}

/** Builds the sparkline container, appends it to the wrapper, and returns it. */
function buildSparklineContainer(wrapperEl) {
  const el = document.createElement('div');
  Object.assign(el.style, {
    flex: '1',
    minHeight: `${SPARK_HEIGHT}px`,
  });
  wrapperEl.appendChild(el);
  return el;
}

/** Mounts a minimal uPlot area sparkline into the given element and returns the uPlot instance. */
function mountSparkline(el, data, color) {
  const series = [
    {},
    {
      stroke: color,
      fill: color + FILL_ALPHA_HEX,
      width: 1.5,
      points: { show: false },
    },
  ];

  return createChart(
    el,
    {
      cursor: { show: false },
      axes: [{ show: false }, { show: false }],
      padding: [4, 0, 4, 0],
      series,
      scales: { x: { time: true } },
    },
    data,
    null,
  );
}
