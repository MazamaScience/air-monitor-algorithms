"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.diurnalStats = diurnalStats;
var _trimDate = require("./trimDate.js");
var _utils = require("./utils.js");
/**
 * Calculate hourly (diurnal) statistics over recent days.
 *
 * Returns five arrays of hourly values:
 * * hour  -- Local-time hour of day [0–23]
 * * count -- Number of non-missing values per hour
 * * min   -- Minimum value at each hour
 * * mean  -- Mean value at each hour
 * * max   -- Maximum value at each hour
 *
 * By default, the most recent 7 full days are used.
 *
 * @param {Array.<DateTime>} datetime - Hourly UTC timestamps as Luxon DateTime objects.
 * @param {Array.<number>} x - Matching array of values (e.g. PM2.5).
 * @param {string} timezone - Olson timezone string (e.g. "America/Los_Angeles").
 * @param {number} dayCount - Number of days to include (default: 7).
 * @returns {object} - Object with hour, count, min, mean, and max arrays.
 */
function diurnalStats(datetime, x, timezone) {
  var dayCount = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : 7;
  // Trim to full local days
  var trimmed = (0, _trimDate.trimDate)(datetime, x, timezone);

  // Return empty result if no full days exist
  if (!Array.isArray(trimmed.datetime) || trimmed.datetime.length < 24 || trimmed.datetime.length !== trimmed.x.length) {
    return {
      hour: [],
      count: [],
      min: [],
      mean: [],
      max: []
    };
  }

  // Use as many recent full days as possible, up to `dayCount`
  var fullDayCount = trimmed.datetime.length / 24;
  dayCount = fullDayCount < dayCount ? fullDayCount : dayCount;
  var startIndex = trimmed.datetime.length - dayCount * 24;

  // Clean data and mark valid values
  var values = (0, _utils.useNull)(trimmed.x);
  var validFlags = values.map(function (v) {
    return v === null ? 0 : 1;
  });
  var hour = [];
  var hourlyCount = [];
  var hourlyMin = [];
  var hourlyMean = [];
  var hourlyMax = [];

  // For each hour of the day (0–23), compute stats across days
  for (var h = 0; h < 24; h++) {
    var min = Number.MAX_VALUE;
    var max = Number.MIN_VALUE;
    var count = 0;
    var sum = null;
    for (var d = 0; d < dayCount; d++) {
      var index = startIndex + h + d * 24;
      if (validFlags[index] === 1) {
        if (sum === null) sum = 0;
        min = values[index] < min ? values[index] : min;
        max = values[index] > max ? values[index] : max;
        sum += values[index];
        count += 1;
      }
    }
    hour[h] = h;
    hourlyMin[h] = min === Number.MAX_VALUE ? null : min;
    hourlyMax[h] = max === Number.MIN_VALUE ? null : max;
    hourlyCount[h] = count;
    hourlyMean[h] = sum === null ? null : sum / count;
  }

  // Round all numeric outputs and use null for missing
  var roundedMin = (0, _utils.roundAndUseNull)(hourlyMin);
  var roundedMean = (0, _utils.roundAndUseNull)(hourlyMean);
  var roundedMax = (0, _utils.roundAndUseNull)(hourlyMax);
  return {
    hour: hour,
    count: hourlyCount,
    min: roundedMin,
    mean: roundedMean,
    max: roundedMax
  };
}