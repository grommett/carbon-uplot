import { resolveColorVar, TRACK_RADIUS, TRACK_WIDTH } from './gauge-config.js';
import { FONT_SANS, FONT_MONO } from '../theme/fonts.js';
import { CU_BORDER_SUBTLE, CU_TEXT_PRIMARY, CU_TEXT_SECONDARY, CU_TEXT_HELPER } from '../theme/vars.js';

const SVG_NS = 'http://www.w3.org/2000/svg';
const START_ANGLE = Math.PI;

/** Viewbox dimensions — arc center is horizontally centered, 14px from the bottom. */
const VIEWBOX_WIDTH = 260;
const VIEWBOX_HEIGHT = 148;
const CX = VIEWBOX_WIDTH / 2;
const CY = VIEWBOX_HEIGHT - 14;

/**
 * Creates a Carbon-styled semicircular gauge using SVG.
 *
 * SVG attributes accept CSS custom properties directly, so theme colors update
 * automatically when setTheme is called — no JS re-draw needed for color changes.
 *
 * Arc color defaults to --cu-interactive when no thresholds are defined.
 * Pass a thresholds array to map value ranges to Carbon status colors.
 *
 * @param {HTMLElement} containerEl - Element to mount the SVG into.
 * @param {object} [config]
 * @param {number} [config.value] - Initial value. Defaults to 0.
 * @param {"info"|"success"|"warning"|"error"} [config.status] - Overrides threshold color lookup.
 * @param {boolean} [config.ticks] - Whether to render tick marks. Defaults to true.
 * @param {{ value: number, status: string }[]} [config.thresholds] - Color threshold definitions, sorted ascending by value.
 * @param {number} [config.min] - Minimum value of the scale. Defaults to 0.
 * @param {number} [config.max] - Maximum value of the scale. Defaults to 100.
 * @param {string} [config.label] - Descriptive label rendered below the arc.
 * @param {(value: number) => string} [config.valueFormat] - Custom formatter for the center value label.
 * @param {string} [config.color] - Direct color override for the arc (hex, CSS custom property, etc). Takes precedence over status and thresholds.
 * @returns {{ setValue: (update: { value: number, status?: string }) => void }}
 */
export function createGauge(
  containerEl,
  {
    value: initialValue = 0,
    status,
    ticks = true,
    thresholds = [],
    min = 0,
    max = 100,
    label,
    valueFormat,
    color,
  } = {},
) {
  const { svg, arcEl, valueLabelEl } = buildGaugeSVG(ticks, min, max, label);
  containerEl.appendChild(svg);

  function setValue({ value, status: statusOverride } = {}) {
    arcEl.setAttribute('d', valueArcPath(value, min, max));
    arcEl.setAttribute('stroke', color ?? resolveColorVar(value, statusOverride ?? status, thresholds));
    valueLabelEl.textContent = valueFormat ? valueFormat(value) : value;
  }

  setValue({ value: initialValue });

  return { setValue };
}

/** Assembles the static SVG structure and returns references to the dynamic elements. */
function buildGaugeSVG(showTicks, min, max, label) {
  const svg = svgEl('svg', { viewBox: `0 0 ${VIEWBOX_WIDTH} ${VIEWBOX_HEIGHT}`, width: '100%' });
  const arcEl = buildArcEl();
  const valueLabelEl = buildValueLabelEl();

  svg.appendChild(buildTrackEl());
  svg.appendChild(arcEl);
  if (showTicks) buildTickValues(min, max).forEach((tickValue) => appendTick(svg, tickValue, min, max));
  svg.appendChild(valueLabelEl);
  if (label) svg.appendChild(buildDescriptiveLabelEl(label));

  return { svg, arcEl, valueLabelEl };
}

/** Creates the static background track (full semicircle). */
function buildTrackEl() {
  return svgEl('path', {
    d: fullSemicirclePath(),
    stroke: CU_BORDER_SUBTLE,
    'stroke-width': TRACK_WIDTH,
    fill: 'none',
  });
}

/** Creates the dynamic arc element whose path and stroke are updated by setValue. */
function buildArcEl() {
  return svgEl('path', { 'stroke-width': TRACK_WIDTH, fill: 'none' });
}

/** Creates the large center value text element. */
function buildValueLabelEl() {
  return svgEl('text', {
    x: CX,
    y: CY - 20,
    'text-anchor': 'middle',
    'dominant-baseline': 'middle',
    fill: CU_TEXT_PRIMARY,
    'font-size': 36,
    'font-weight': 300,
    'font-family': FONT_SANS,
  });
}

/** Creates the static descriptive label rendered below the value. */
function buildDescriptiveLabelEl(label) {
  const el = svgEl('text', {
    x: CX,
    y: CY + 10,
    'text-anchor': 'middle',
    'dominant-baseline': 'middle',
    fill: CU_TEXT_SECONDARY,
    'font-size': 12,
    'font-family': FONT_SANS,
  });
  el.textContent = label;
  return el;
}

/** Builds the SVG arc path string for a given value mapped to [min, max]. */
function valueArcPath(value, min, max) {
  const ratio = (value - min) / (max - min);
  const angle = START_ANGLE + ratio * Math.PI;
  const endX = (CX + TRACK_RADIUS * Math.cos(angle)).toFixed(3);
  const endY = (CY + TRACK_RADIUS * Math.sin(angle)).toFixed(3);

  if (ratio <= 0) return '';
  if (ratio >= 1) return fullSemicirclePath();

  return `M ${CX - TRACK_RADIUS} ${CY} A ${TRACK_RADIUS} ${TRACK_RADIUS} 0 0 1 ${endX} ${endY}`;
}

/**
 * Full 180 semicircle split into two 90 arcs to avoid the degenerate case
 * where start and end are the same point.
 */
function fullSemicirclePath() {
  return [
    `M ${CX - TRACK_RADIUS} ${CY}`,
    `A ${TRACK_RADIUS} ${TRACK_RADIUS} 0 0 1 ${CX} ${CY - TRACK_RADIUS}`,
    `A ${TRACK_RADIUS} ${TRACK_RADIUS} 0 0 1 ${CX + TRACK_RADIUS} ${CY}`,
  ].join(' ');
}

/** Returns five evenly-spaced tick values across [min, max]. */
function buildTickValues(min, max) {
  const range = max - min;
  return [0, 0.25, 0.5, 0.75, 1].map((ratio) => min + ratio * range);
}

/** Appends a tick mark and its label to the SVG at the given gauge value position. */
function appendTick(svg, tickValue, min, max) {
  const ratio = (tickValue - min) / (max - min);
  const angle = START_ANGLE + ratio * Math.PI;
  const innerRadius = TRACK_RADIUS - TRACK_WIDTH / 2 - 4;
  const outerRadius = TRACK_RADIUS + TRACK_WIDTH / 2 + 4;
  const labelRadius = TRACK_RADIUS + TRACK_WIDTH / 2 + 16;
  const cos = Math.cos(angle);
  const sin = Math.sin(angle);
  const labelEl = svgEl('text', {
    x: (CX + labelRadius * cos).toFixed(3),
    y: (CY + labelRadius * sin).toFixed(3),
    'text-anchor': 'middle',
    'dominant-baseline': 'middle',
    fill: CU_TEXT_HELPER,
    'font-size': 10,
    'font-family': FONT_MONO,
  });

  svg.appendChild(
    svgEl('line', {
      x1: (CX + innerRadius * cos).toFixed(3),
      y1: (CY + innerRadius * sin).toFixed(3),
      x2: (CX + outerRadius * cos).toFixed(3),
      y2: (CY + outerRadius * sin).toFixed(3),
      stroke: CU_TEXT_HELPER,
      'stroke-width': 1.5,
    }),
  );
  labelEl.textContent = tickValue.toLocaleString();
  svg.appendChild(labelEl);
}

/** Creates an SVG element with the given attributes. */
function svgEl(tag, attrs) {
  const el = document.createElementNS(SVG_NS, tag);
  Object.entries(attrs).forEach(([key, val]) => el.setAttribute(key, val));
  return el;
}
