import { roundAndUseNull } from "./utils.js";

/**
 * Calculate an array of NowCast values from hourly PM measurements.
 *
 * Uses a 12-hour rolling window and the EPA NowCast algorithm to calculate
 * weighted averages. Missing values should be represented by `null`.
 *
 * The returned array is the same length as the input, but early entries
 * may contain `null` due to insufficient data.
 *
 * @param {Array<number|null>} pm - Hourly PM2.5 or PM10 values (no gaps).
 * @returns {Array<number|null>} - Array of NowCast values, rounded to 1 decimal place.
 */
export function pm_nowcast(pm) {
  // Validate input
  if (!Array.isArray(pm)) {
    throw new Error("Input to pm_nowcast() must be an array.");
  }

  // NOTE:  We only use the index `i`, not the actual PM value, so `_` is used to
  // NOTE:  indicate an unused parameter. The underscore `_` is a common
  // NOTE:  convention in JavaScript to mean "I don't need this value".
  const nowcast = pm.map((_, i) => {
    const end = i + 1;
    const start = end < 12 ? 0 : end - 12;
    const window = pm.slice(start, end);
    return nowcastPM(window);
  });

  // Round to one decimal place and convert non-numeric values to null
  return roundAndUseNull(nowcast);
}

/**
 * Compute a single NowCast value from up to 12 hours of data.
 *
 * Applies EPA's NowCast formula, using exponential weighting that depends
 * on how much values vary over time. Returns `null` if too little recent
 * data is available.
 *
 * @private
 * @param {Array<number|null>} x - Up to 12 hourly values in chronological order.
 * @returns {number|null} - Single NowCast value, or null if data is insufficient.
 */
function nowcastPM(x) {
  // Allow single number input
  if (typeof x === "number") x = [x];

  // NOTE:  The NowCast algorithm expects values in reverse chronological order
  // NOTE:  Missing values are treated as NaN to avoid incorrect math results,
  // NOTE:  because in JavaScript: null * 1 = 0, which would corrupt the weighting step.
  x = x.reverse().map((o) => (o === null ? NaN : o));

  // NOTE: EPA requires at least 2 valid values in the most recent 3 hours
  const recentValidCount = x
    .slice(0, 3)
    .reduce((a, o) => (Number.isNaN(o) ? a : a + 1), 0);
  if (recentValidCount < 2) return null;

  // Identify indices of valid values (non-NaN)
  const validIndices = x.reduce(
    (a, o, i) => (Number.isNaN(o) ? a : a.concat(i)),
    []
  );

  // Calculate min and max while ignoring NaN
  const validValues = x.filter((o) => !Number.isNaN(o));
  if (validValues.length === 0) return null;

  const max = validValues.reduce((a, o) => (o > a ? o : a));
  const min = validValues.reduce((a, o) => (o < a ? o : a));

  // Compute "scaled rate of change" = (max - min) / max
  const scaledRateOfChange = (max - min) / max;

  // Convert scaled rate into a weight factor within the range [0.5, 1.0]
  const weightFactor =
    1 - scaledRateOfChange < 0.5 ? 0.5 : 1 - scaledRateOfChange;

  // Compute weighted values, applying less weight to older values
  const weightedValues = x
    .map((o, i) => o * Math.pow(weightFactor, i))
    .filter((o) => !Number.isNaN(o));

  if (weightedValues.length === 0) return null;

  const weightedSum = weightedValues.reduce((a, o) => a + o);

  // Compute the sum of weights used for normalization
  const weightFactorSum = validIndices
    .map((i) => Math.pow(weightFactor, i))
    .reduce((a, o) => a + o);

  // Final NowCast value, rounded to 1 decimal place
  let returnVal = parseFloat((weightedSum / weightFactorSum).toFixed(1));

  // If the result is not a number, return null
  returnVal = Number.isNaN(returnVal) ? null : returnVal;

  return returnVal;
}
