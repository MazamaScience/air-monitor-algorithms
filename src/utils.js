/**
 * roundAndUseNull
 *
 * Convert an array of numbers to an array where each number is rounded to a fixed
 * number of decimal places. Any value that is not a valid number (NaN, undefined, null)
 * will be converted to `null`.
 *
 * @param {Array<number>} x - The input array of values.
 * @param {number} digits - Number of decimal places to round to (default is 1).
 * @returns {Array<number|null>} - New array with rounded values or nulls.
 */
export function roundAndUseNull(x, digits = 1) {
  const factor = 10 ** digits;

  return x.map((value) => {
    // Replace non-numeric or missing values with null
    if (!Number.isFinite(value)) return null;

    // Round numeric value to specified decimal places
    return Math.round(value * factor) / factor;
  });
}

/**
 * useNull
 *
 * Convert an array so that any undefined, null, or non-numeric (NaN) values
 * are replaced by `null`.
 *
 * @param {Array<*>} x - Input array with possibly invalid values.
 * @returns {Array<number|null>} - Cleaned array with only numbers or nulls.
 */
export function useNull(x) {
  return x.map((value) => (Number.isFinite(value) ? value : null));
}

/**
 * arrayMin
 *
 * Return the smallest number from the array, ignoring any non-numeric values.
 * Returns null if no valid numbers are present.
 *
 * @param {Array<*>} x - Input array.
 * @returns {number|null} - Minimum number or null if none found.
 */
export function arrayMin(x) {
  const valid = useNull(x).filter((v) => v !== null);
  return valid.length > 0 ? Math.min(...valid) : null;
}

/**
 * arrayMax
 *
 * Return the largest number from the array, ignoring any non-numeric values.
 * Returns null if no valid numbers are present.
 *
 * @param {Array<*>} x - Input array.
 * @returns {number|null} - Maximum number or null if none found.
 */
export function arrayMax(x) {
  const valid = useNull(x).filter((v) => v !== null);
  return valid.length > 0 ? Math.max(...valid) : null;
}

/**
 * arrayCount
 *
 * Count the number of valid numeric values in the array.
 *
 * @param {Array<*>} x - Input array.
 * @returns {number} - Count of numbers (excluding nulls and invalid values).
 */
export function arrayCount(x) {
  return useNull(x).filter((v) => v !== null).length;
}

/**
 * arraySum
 *
 * Sum all valid numeric values in the array. Returns null if all values are invalid.
 *
 * @param {Array<*>} x - Input array.
 * @returns {number|null} - Sum of numbers or null if no valid values.
 */
export function arraySum(x) {
  const valid = useNull(x).filter((v) => v !== null);
  return valid.length > 0 ? valid.reduce((a, b) => a + b, 0) : null;
}

/**
 * arrayMean
 *
 * Calculate the average (mean) of valid numbers in the array.
 * Returns null if no valid numbers are present.
 *
 * @param {Array<*>} x - Input array.
 * @returns {number|null} - Mean of valid values or null.
 */
export function arrayMean(x) {
  const valid = useNull(x).filter((v) => v !== null);
  return valid.length > 0 ? arraySum(valid) / valid.length : null;
}
