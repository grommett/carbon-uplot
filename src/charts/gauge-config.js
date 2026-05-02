export const TRACK_RADIUS = 90;
export const TRACK_WIDTH = 14;

/**
 * Resolves the CSS custom property for the gauge arc color.
 *
 * Returns var(--cu-interactive) when no thresholds are defined.
 * With thresholds (sorted ascending by value), finds the last threshold
 * whose value is <= the current gauge value. Returns a var() string so
 * the color tracks theme changes without any JS re-draw.
 *
 * @param {number} value - Current gauge value in real units.
 * @param {"info"|"success"|"warning"|"error"|undefined} status - Explicit status override.
 * @param {{ value: number, status: string }[]} thresholds - Sorted ascending by value.
 * @returns {string} e.g. "var(--cu-support-success)"
 */
import { CU_INTERACTIVE, cuSupport } from '../theme/vars.js';

export function resolveColorVar(value, status, thresholds) {
  if (status) return cuSupport(status);
  if (!thresholds?.length) return CU_INTERACTIVE;
  const matched = thresholds.reduce((best, threshold) => {
    return value >= threshold.value ? threshold : best;
  }, null);
  return matched ? cuSupport(matched.status) : CU_INTERACTIVE;
}
