import { FONT_SANS, FONT_MONO } from '../../theme/fonts.js';

export const ROW_CLASS = 'cu-tooltip__row';

/**
 * Injects the tooltip stylesheet once per document. Safe to call multiple times.
 *
 * Uses a CSS pseudo-selector so the last row never gets a bottom border,
 * including when series are hidden (hidden rows stay in the DOM at their
 * original position, so :last-child remains stable).
 */
export function injectTooltipStyles() {
  if (document.getElementById('cu-tooltip-styles')) return;
  const style = document.createElement('style');
  style.id = 'cu-tooltip-styles';
  style.textContent = `.${ROW_CLASS}:not(:last-child) { border-bottom: 1px solid var(--cu-grid); }`;
  document.head.appendChild(style);
}

/**
 * Tooltip background defaults to --cu-background (page surface).
 *
 * When a chart lives inside an elevated container (tile, panel, modal), set
 * --cu-tooltip-bg on that container so the tooltip matches its surface:
 *
 *   .my-tile  { --cu-tooltip-bg: var(--cu-layer-01); }
 *   .my-panel { --cu-tooltip-bg: var(--cu-layer-02); }
 *
 * All charts inside the container inherit it automatically.
 */
export const TOOLTIP_STYLES = {
  position: 'absolute',
  pointerEvents: 'none',
  background: 'var(--cu-tooltip-bg, var(--cu-background))',
  boxShadow: '0 2px 6px rgba(0, 0, 0, 0.3)',
  fontSize: '12px',
  fontFamily: FONT_SANS,
  color: 'var(--cu-text-primary)',
  minWidth: '160px',
  zIndex: '100',
  display: 'none',
};

export const HEADER_STYLES = {
  padding: '8px 12px 6px',
  borderBottom: '1px solid var(--cu-grid)',
  fontFamily: FONT_MONO,
  fontSize: '11px',
  color: 'var(--cu-text-primary)',
};

export const ROW_STYLES = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: '24px',
  padding: '5px 12px 5px 9px',
};

export const VALUE_STYLES = {
  fontFamily: FONT_MONO,
  fontSize: '11px',
  color: 'var(--cu-text-primary)',
};
