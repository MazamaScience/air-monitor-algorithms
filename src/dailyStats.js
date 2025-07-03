import { trimDate } from "./trimDate.js";
import {
  arrayCount,
  arrayMin,
  arrayMean,
  arrayMax,
  roundAndUseNull,
  useNull,
} from "./utils.js";

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
export function dailyStats(datetime, x, timezone) {
  // Trim to full days in the specified local timezone
  const trimmed = trimDate(datetime, x, timezone);

  // TODO: Add support for minCount valid values and partial days

    // NOTE: Return empty result if fewer than 24 aligned values
  if (
    !Array.isArray(trimmed.datetime) ||
    trimmed.datetime.length < 24 ||
    trimmed.datetime.length !== trimmed.x.length
  ) {
    return {
      datetime: [],
      count: [],
      min: [],
      mean: [],
      max: [],
    };
  }

  const dayCount = trimmed.datetime.length / 24;

  const dailyDatetime = [];
  const dailyCount = [];
  const dailyMin = [];
  const dailyMean = [];
  const dailyMax = [];

  for (let i = 0; i < dayCount; i++) {
    const start = i * 24;
    const end = start + 24;

    // Each day’s timestamp is the first hour of the day
    dailyDatetime[i] = trimmed.datetime[start];

    // Daily stats are calculated using 24 hourly values
    const values = trimmed.x.slice(start, end);
    dailyCount[i] = arrayCount(values);
    dailyMin[i] = arrayMin(values);
    dailyMean[i] = arrayMean(values);
    dailyMax[i] = arrayMax(values);
  }

  // Round all values (0 decimals for count, 1 for everything else)
  const roundedCount = roundAndUseNull(dailyCount, 0);
  const roundedMin = roundAndUseNull(dailyMin);
  const roundedMean = roundAndUseNull(dailyMean);
  const roundedMax = roundAndUseNull(dailyMax);

  return {
    datetime: dailyDatetime,
    count: roundedCount,
    min: roundedMin,
    mean: roundedMean,
    max: roundedMax,
  };
}
