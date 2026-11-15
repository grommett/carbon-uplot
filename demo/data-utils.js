const LCG_MULTIPLIER = 16807;
const LCG_MODULUS = 2147483647;

/**
 * Generates a deterministic series of pseudo-random numbers
 * using a linear congruential generator (LCG). Useful for
 * reproducible demos and tests.
 *
 * @param {number} count - Number of values to generate.
 * @param {number} min - Minimum value (inclusive).
 * @param {number} max - Maximum value (exclusive).
 * @param {number} seed - Integer seed for the LCG.
 * @returns {number[]}
 */
export function seededRandomSeries(count, min, max, seed) {
  let currentSeed = seed | 1;

  return Array.from({ length: count }).map(() => {
    currentSeed = (currentSeed * LCG_MULTIPLIER) % LCG_MODULUS;
    return +(min + (currentSeed / LCG_MODULUS) * (max - min)).toFixed(2);
  });
}

/**
 * Smooths a numeric series using a sliding window average.
 *
 * @param {number[]} values - Input series.
 * @param {number} windowSize - Half-width of the sliding window.
 * @returns {number[]}
 */
export function smoothSeries(values, windowSize) {
  return values.map((_, index) => {
    const windowSlice = values.slice(Math.max(0, index - windowSize), index + windowSize + 1);
    const average = windowSlice.reduce((sum, val) => sum + val, 0) / windowSlice.length;
    return +average.toFixed(2);
  });
}
