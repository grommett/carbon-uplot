export const CU_INTERACTIVE = 'var(--cu-interactive)';
export const CU_SUPPORT_SUCCESS = 'var(--cu-support-success)';
export const CU_BORDER_SUBTLE = 'var(--cu-border-subtle)';
export const CU_TEXT_PRIMARY = 'var(--cu-text-primary)';
export const CU_TEXT_SECONDARY = 'var(--cu-text-secondary)';
export const CU_TEXT_HELPER = 'var(--cu-text-helper)';

/**
 * Returns the CSS custom property string for a Carbon support color.
 *
 * @param {string} status - e.g. "success", "warning", "error", "info".
 * @returns {string} e.g. "var(--cu-support-success)"
 */
export function cuSupport(status) {
  return `var(--cu-support-${status})`;
}
