/**
 * Returns an array of NowCast values derived from the incoming time series.
 * Missing values should be 'null'.
 * **NOTE:** Incoming data must be on an hourly axis with no gaps.
 * @param {...number} pm25 Array of PM 2.5 measurements.
 * @returns {...number} Array of NowCast values.
 */
export function pm25_nowcast(pm25) {
  // TODO:  Validate that pm25 is
  // See:  https://observablehq.com/@openaq/epa-pm-nowcast
  let nowcast = Array(pm25.length);
  for (let i = 0; i < pm25.length; i++) {
    let end = i + 1;
    let start = end < 12 ? 0 : end - 12;
    nowcast[i] = nowcastPM(pm25.slice(start, end));
  }
  return nowcast;
}

/**
 * Convert an array of up to 12 PM2.5 measurements in chronological order
 * into a single NowCast value. Missing values should be 'null'.
 * **NOTE:** Incoming data must be on an hourly axis with no gaps.
 * @param {...Number} x Array of 12 values in chronological order.
 * @returns {Number} NowCast value.
 */
function nowcastPM(x) {
  // NOTE:  We don't insist on 12 hours of data. Convert single values into arrays.
  if (typeof x === "number") x = [x];

  // NOTE:  map/reduce syntax: a: accumulator; o: object; i: index

  // NOTE:  The algorithm below assumes reverse chronological order.
  // NOTE:  WARNING:  In javascript `null * 1 = 0` which messes up things in
  // NOTE:  our mapping functions. So we convert all null to NaN
  // NOTE:  and then back to null upon return.
  x = x.reverse().map((o) => (o === null ? NaN : o));

  // Check for recent values;
  let recentValidCount = x
    .slice(0, 3)
    .reduce((a, o) => (Number.isNaN(o) ? a : a + 1), 0);
  if (recentValidCount < 2) return null;

  let validIndices = x.reduce(
    (a, o, i) => (Number.isNaN(o) ? a : a.concat(i)),
    []
  );

  // NOTE:  max and min calculations need to be tolerant of missing values
  let max = x.filter((o) => !Number.isNaN(o)).reduce((a, o) => (o > a ? o : a));
  let min = x.filter((o) => !Number.isNaN(o)).reduce((a, o) => (o < a ? o : a));
  let scaledRateOfChange = (max - min) / max;
  let weightFactor =
    1 - scaledRateOfChange < 0.5 ? 0.5 : 1 - scaledRateOfChange;

  // TODO:  Check for any valid values before attempting to reduce.
  // TODO:  If all NaN, then simple return null.

  let weightedValues = x
    .map((o, i) => o * Math.pow(weightFactor, i)) // maps onto an array including NaN
    .filter((x) => !Number.isNaN(x)); // remove NaN before calculating sum

  let weightedSum = null;
  if (weightedValues.length == 0) {
    return null;
  } else {
    weightedSum = weightedValues.reduce((a, o) => a + o);
  }

  let weightFactorSum = validIndices
    .map((o) => Math.pow(weightFactor, o))
    .reduce((a, o) => a + o);

  let returnVal = parseFloat((weightedSum / weightFactorSum).toFixed(1));

  // Convert NaN back to null for Highcharts
  returnVal = Number.isNaN(returnVal) ? null : returnVal;
  return returnVal;
}
