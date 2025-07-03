"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.arrayCount = arrayCount;
exports.arrayMax = arrayMax;
exports.arrayMean = arrayMean;
exports.arrayMin = arrayMin;
exports.arraySum = arraySum;
exports.roundAndUseNull = roundAndUseNull;
exports.useNull = useNull;
function _toConsumableArray(r) { return _arrayWithoutHoles(r) || _iterableToArray(r) || _unsupportedIterableToArray(r) || _nonIterableSpread(); }
function _nonIterableSpread() { throw new TypeError("Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }
function _unsupportedIterableToArray(r, a) { if (r) { if ("string" == typeof r) return _arrayLikeToArray(r, a); var t = {}.toString.call(r).slice(8, -1); return "Object" === t && r.constructor && (t = r.constructor.name), "Map" === t || "Set" === t ? Array.from(r) : "Arguments" === t || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(t) ? _arrayLikeToArray(r, a) : void 0; } }
function _iterableToArray(r) { if ("undefined" != typeof Symbol && null != r[Symbol.iterator] || null != r["@@iterator"]) return Array.from(r); }
function _arrayWithoutHoles(r) { if (Array.isArray(r)) return _arrayLikeToArray(r); }
function _arrayLikeToArray(r, a) { (null == a || a > r.length) && (a = r.length); for (var e = 0, n = Array(a); e < a; e++) n[e] = r[e]; return n; }
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
function roundAndUseNull(x) {
  var digits = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 1;
  var factor = Math.pow(10, digits);
  return x.map(function (value) {
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
function useNull(x) {
  return x.map(function (value) {
    return Number.isFinite(value) ? value : null;
  });
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
function arrayMin(x) {
  var valid = useNull(x).filter(function (v) {
    return v !== null;
  });
  return valid.length > 0 ? Math.min.apply(Math, _toConsumableArray(valid)) : null;
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
function arrayMax(x) {
  var valid = useNull(x).filter(function (v) {
    return v !== null;
  });
  return valid.length > 0 ? Math.max.apply(Math, _toConsumableArray(valid)) : null;
}

/**
 * arrayCount
 *
 * Count the number of valid numeric values in the array.
 *
 * @param {Array<*>} x - Input array.
 * @returns {number} - Count of numbers (excluding nulls and invalid values).
 */
function arrayCount(x) {
  return useNull(x).filter(function (v) {
    return v !== null;
  }).length;
}

/**
 * arraySum
 *
 * Sum all valid numeric values in the array. Returns null if all values are invalid.
 *
 * @param {Array<*>} x - Input array.
 * @returns {number|null} - Sum of numbers or null if no valid values.
 */
function arraySum(x) {
  var valid = useNull(x).filter(function (v) {
    return v !== null;
  });
  return valid.length > 0 ? valid.reduce(function (a, b) {
    return a + b;
  }, 0) : null;
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
function arrayMean(x) {
  var valid = useNull(x).filter(function (v) {
    return v !== null;
  });
  return valid.length > 0 ? arraySum(valid) / valid.length : null;
}