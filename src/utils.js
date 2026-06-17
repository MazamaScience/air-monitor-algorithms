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
 * @example
 * roundAndUseNull([1.234, null, NaN, 5.678])  // => [1.2, null, null, 5.7]
 * roundAndUseNull([1.234, 5.678], 0)           // => [1, 6]
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
 * @example
 * useNull([1, null, NaN, undefined, 5])  // => [1, null, null, null, 5]
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
 * @example
 * arrayMin([5, null, 2, null, 8])  // => 2
 * arrayMin([null, null])           // => null
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
 * @example
 * arrayMax([5, null, 2, null, 8])  // => 8
 * arrayMax([null, null])           // => null
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
 * @example
 * arrayCount([5, null, 2, null, 8])  // => 3
 * arrayCount([null, null])           // => 0
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
 * @example
 * arraySum([5, null, 2, null, 8])  // => 15
 * arraySum([null, null])           // => null
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
 * @example
 * arrayMean([5, null, 2, null, 8])  // => 5
 * arrayMean([null, null])           // => null
 */
export function arrayMean(x) {
  const valid = useNull(x).filter((v) => v !== null);
  return valid.length > 0 ? arraySum(valid) / valid.length : null;
}



/**
 * QC_negativeValues
 *
 * Apply a quality-control pass for negative values to an array of measurements.
 * Negative concentrations are not physically meaningful for the data this
 * library handles, so they must be corrected or removed before computing
 * statistics. How aggressively they are removed depends on the QC mode.
 *
 * Modes:
 * * "keep" -- Salvage near-zero readings. Small negatives in [-10, 0) are
 *             treated as instrument noise and clamped to 0; values below -10
 *             are considered unrecoverable and set to `null` (missing).
 * * "drop" -- Strict. Any negative value is set to `null` (missing).
 *
 * In both modes, non-numeric or missing values (NaN, undefined, null) become
 * `null`, and non-negative values pass through unchanged.
 *
 * @param {Array<*>} x - Input array of values (e.g. PM2.5 concentrations).
 * @param {string} type - QC mode: "keep" or "drop".
 * @returns {Array<number|null>} - New array with QC applied.
 * @throws {Error} If `type` is not "keep" or "drop".
 * @example
 * // "keep": clamp small negatives to 0, drop values below -10
 * QC_negativeValues([5, -2, -15, null], "keep")  // => [5, 0, null, null]
 *
 * // "drop": remove all negatives
 * QC_negativeValues([5, -2, -15, null], "drop")  // => [5, null, null, null]
 */
export function QC_negativeValues(x, type) {
  if (type !== "keep" && type !== "drop") {
    throw new Error(
      `QC_negativeValues: invalid type "${type}"; expected "keep" or "drop".`
    );
  }

  return x.map((value) => {
    // Treat any non-numeric or missing value as missing
    if (!Number.isFinite(value)) return null;

    // Non-negative values are valid and pass through unchanged
    if (value >= 0) return value;

    if (type === "drop") {
      // Strict mode: any negative value is dropped as missing
      return null;
    }

    // "keep" mode: clamp small negatives (instrument noise) to 0,
    // but drop values that are too negative to be salvageable.
    return value < -10 ? null : 0;
  });
}