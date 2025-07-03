"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.dailyStats = dailyStats;
var _trimDate = require("./trimDate.js");
var _utils = require("./utils.js");
/**
 * Calculate daily statistics over a time series of hourly values.
 *
 * Returns five arrays of daily values:
 * * datetime -- Luxon DateTime marking the start of each day (local time)
 * * count    -- Number of valid hourly values each day
 * * min      -- Minimum value each day
 * * mean     -- Mean value each day
 * * max      -- Maximum value each day
 *
 * @param {Array.<DateTime>} datetime - Hourly UTC timestamps as Luxon DateTime objects.
 * @param {Array.<number>} x - Array of hourly values.
 * @param {string} timezone - Olson time zone (e.g. "America/Los_Angeles").
 * @returns {object} - Object with datetime, count, min, mean, and max arrays.
 */
function dailyStats(datetime, x, timezone) {
  // Trim to full days in the specified local timezone
  var trimmed = (0, _trimDate.trimDate)(datetime, x, timezone);

  // TODO: Add support for minCount valid values and partial days

  // NOTE: Return empty result if fewer than 24 aligned values
  if (!Array.isArray(trimmed.datetime) || trimmed.datetime.length < 24 || trimmed.datetime.length !== trimmed.x.length) {
    return {
      datetime: [],
      count: [],
      min: [],
      mean: [],
      max: []
    };
  }
  var dayCount = trimmed.datetime.length / 24;
  var dailyDatetime = [];
  var dailyCount = [];
  var dailyMin = [];
  var dailyMean = [];
  var dailyMax = [];
  for (var i = 0; i < dayCount; i++) {
    var start = i * 24;
    var end = start + 24;

    // Each day’s timestamp is the first hour of the day
    dailyDatetime[i] = trimmed.datetime[start];

    // Daily stats are calculated using 24 hourly values
    var values = trimmed.x.slice(start, end);
    dailyCount[i] = (0, _utils.arrayCount)(values);
    dailyMin[i] = (0, _utils.arrayMin)(values);
    dailyMean[i] = (0, _utils.arrayMean)(values);
    dailyMax[i] = (0, _utils.arrayMax)(values);
  }

  // Round all values (0 decimals for count, 1 for everything else)
  var roundedCount = (0, _utils.roundAndUseNull)(dailyCount, 0);
  var roundedMin = (0, _utils.roundAndUseNull)(dailyMin);
  var roundedMean = (0, _utils.roundAndUseNull)(dailyMean);
  var roundedMax = (0, _utils.roundAndUseNull)(dailyMax);
  return {
    datetime: dailyDatetime,
    count: roundedCount,
    min: roundedMin,
    mean: roundedMean,
    max: roundedMax
  };
}