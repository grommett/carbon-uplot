import { THEMES } from './themes-tokens.js';
import { FONT_MONO } from './fonts.js';

export const CARBON_CLASS_TO_THEME = {
  'cds--white': 'white',
  'cds--g10': 'g10',
  'cds--g90': 'g90',
  'cds--g100': 'g100',
};

/**
 * Default series color palette — Carbon g100 categorical colors in visual-contrast order. Chart functions cycle through
 * this when a series does not specify a color.
 */
export const PALETTE = [
  '#4589ff', // blue
  '#3ddbd9', // teal
  '#be95ff', // purple
  '#42be65', // green
  '#ff832b', // orange
  '#f1c21b', // yellow
  '#ff8389', // red
];

/**
 * Returns a base uPlot axis configuration merged with per-axis overrides.
 *
 * Axis and grid stroke colors are read from --cu-axis / --cu-grid CSS custom
 * properties at call time so charts pick up the active theme when created.
 * To switch themes on an existing chart, recreate it after calling setTheme.
 *
 * @param {object} [overrides] - Any uPlot axis options to merge in.
 * @returns {object}
 */
export function createAxisConfig(overrides = {}) {
  const axisStroke = getStyleProps('--cu-axis');
  const gridStroke = getStyleProps('--cu-grid');

  return {
    stroke: axisStroke,
    ticks: { stroke: gridStroke, width: 1 },
    grid: { stroke: gridStroke, width: 1 },
    font: `11px ${FONT_MONO}`,
    ...overrides,
  };
}

/**
 * Reads a CSS custom property from the document root, falling back to the hardcoded token value
 * for the active theme when the property is not set as a computed style.
 *
 * @param {string} prop - CSS custom property name (e.g. `'--cu-axis'`).
 * @returns {string}
 */
function getStyleProps(prop) {
  const style = getComputedStyle(document.documentElement);
  const tokens = THEMES[detectThemeName()];
  return style.getPropertyValue(prop).trim() || tokens[prop] || '';
}

/**
 * Infers the active Carbon theme name from the CSS class on `<html>`.
 *
 * @returns {'white' | 'g10' | 'g90' | 'g100'}
 */
function detectThemeName() {
  const cssClass = Object.keys(CARBON_CLASS_TO_THEME).find((themeClass) =>
    document.documentElement.classList.contains(themeClass),
  );
  return CARBON_CLASS_TO_THEME[cssClass] ?? 'white';
}
