/**
 * Carbon Design System theme token maps.
 *
 * Token values are generated from @carbon/themes — run `npm run generate:themes`
 * to update them when Carbon releases a new version.
 *
 * Layer tokens follow Carbon's layering model:
 *   --cu-layer-01  first surface above $background (cards, panels)
 *   --cu-layer-02  second surface (dropdowns, tooltips above layer-01 content)
 *   --cu-layer     contextual alias — defaults to --cu-layer-01 globally.
 *                  Override on a container when charts sit on an elevated surface:
 *                  .my-modal { --cu-layer: var(--cu-layer-02); }
 *
 * Border tokens follow Carbon's per-layer subtle border values:
 *   --cu-border-subtle     for elements on $background or $layer-01
 *   --cu-border-subtle-02  for elements on $layer-02 (e.g. tooltip header divider)
 *
 * Note: uPlot axis and grid colors are set at chart-creation time and are not
 * updated by setTheme. To apply a new theme to axes, recreate the chart.
 */
import { THEMES } from './themes-tokens.js';
import { THEME_CHANGE_EVENT } from '../events.js';

export { THEMES };

/**
 * Applies a Carbon theme by writing --cu-* CSS custom properties to a root element.
 *
 * Components that render via DOM (tooltip, legend) update automatically.
 * Canvas-based components (gauge) re-draw by listening via onThemeChange.
 * uPlot axis and grid colors require chart re-creation to update.
 *
 * @param {"white"|"g10"|"g90"|"g100"} name - The Carbon theme to apply.
 * @param {Element} [rootEl] - Element to set properties on. Defaults to document.documentElement.
 */
export function setTheme(name, rootEl = document.documentElement) {
  const tokens = THEMES[name];
  if (!tokens) {
    throw new Error(`carbon-uplot: unknown theme "${name}". Available: ${Object.keys(THEMES).join(', ')}`);
  }
  Object.entries(tokens).forEach(([prop, value]) => rootEl.style.setProperty(prop, value));
  document.dispatchEvent(new CustomEvent(THEME_CHANGE_EVENT, { detail: { name } }));
}

/**
 * Registers a handler that fires whenever the Carbon theme changes.
 *
 * Fires when setTheme() is called, or when any code dispatches a
 * `cu-theme-change` CustomEvent on `document`.
 *
 * Returns an unsubscribe function. Use this for canvas components that need to
 * re-draw when the theme changes.
 *
 * @param {(event: CustomEvent<{ name: string }>) => void} handler
 * @returns {() => void} Unsubscribe function.
 */
export function onThemeChange(handler) {
  document.addEventListener(THEME_CHANGE_EVENT, handler);
  return () => document.removeEventListener(THEME_CHANGE_EVENT, handler);
}
