export const HIDDEN_OPACITY = '0.3';
export const VISIBLE_OPACITY = '';

export const LEGEND_STYLES = {
  display: 'flex',
  flexWrap: 'wrap',
  gap: '12px',
};

export const LEGEND_BOTTOM_STYLES = {
  marginTop: '8px',
  paddingTop: '8px',
  borderTop: '0.5px solid var(--cu-border-subtle)',
};

export const LEGEND_TOP_STYLES = {
  marginBottom: '8px',
  paddingBottom: '8px',
  borderBottom: '0.5px solid var(--cu-border-subtle)',
};

export const ITEM_STYLES = {
  display: 'flex',
  alignItems: 'center',
  gap: '5px',
  fontSize: '11px',
  fontFamily: 'inherit',
  color: 'var(--cu-text-secondary)',
  background: 'none',
  border: 'none',
  padding: '0',
  cursor: 'pointer',
};

export const SWATCH_STYLES = {
  width: '16px',
  height: '2px',
  flexShrink: '0',
};

export function applyStyles(el, styles) {
  Object.assign(el.style, styles);
}
