import { trimDate } from "./trimDate.js";
import {
  arrayCount,
  arrayMin,
  arrayMean,
  arrayMax,
  roundAndUseNull,
  QC_negativeValues,
} from "./utils.js";

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
 * @param {Array.<number|null>} x - Matching array of values (e.g. PM2.5).
 * @param {string} timezone - Olson timezone string (e.g. "America/Los_Angeles").
 * @param {number} dayCount - Number of recent full days to include (default: 7).
 *   If fewer full days are available, all available days are used.
 * @param {string} qc - Negative-value QC mode passed to QC_negativeValues: "keep"
 *   (clamp small negatives to 0, drop values below -10) or "drop" (drop all
 *   negatives). Default: "keep".
 * @returns {object} - Object with hour, count, min, mean, and max arrays.
 * @example
 * const result = diurnalStats(datetime, pm25, "America/Los_Angeles");
 * // result.hour   — [0, 1, 2, ..., 23]
 * // result.count  — [7, 7, 7, ..., 6]   (days contributing to each hour)
 * // result.min    — [1.2, 0.8, ..., 3.1]
 * // result.mean   — [4.5, 3.2, ..., 9.8]
 * // result.max    — [12.0, 8.4, ..., 22.3]
 */
export function diurnalStats(datetime, x, timezone, dayCount = 7, qc = "keep") {
  // Trim to full local days
  const trimmed = trimDate(datetime, x, timezone);

  // Return empty result if no full days exist
  if (
    !Array.isArray(trimmed.datetime) ||
    trimmed.datetime.length < 24 ||
    trimmed.datetime.length !== trimmed.x.length
  ) {
    return {
      hour: [],
      count: [],
      min: [],
      mean: [],
      max: [],
    };
  }

  // Use as many recent full days as possible, up to `dayCount`
  const fullDayCount = trimmed.datetime.length / 24;
  const effectiveDayCount = Math.min(fullDayCount, dayCount);
  const startIndex = trimmed.datetime.length - effectiveDayCount * 24;

  // Apply the negative-value QC pass. The qc mode controls how negatives are
  // handled (see QC_negativeValues); "keep" clamps small negatives to 0 and
  // drops values below -10 as missing.
  const values = QC_negativeValues(trimmed.x, qc);

  const hour = [];
  const hourlyCount = [];
  const hourlyMin = [];
  const hourlyMean = [];
  const hourlyMax = [];

  // For each hour of the day (0–23), collect values across days and compute stats
  for (let h = 0; h < 24; h++) {
    const hourValues = [];
    for (let d = 0; d < effectiveDayCount; d++) {
      hourValues.push(values[startIndex + h + d * 24]);
    }

    hour[h] = h;
    hourlyCount[h] = arrayCount(hourValues);
    hourlyMin[h] = arrayMin(hourValues);
    hourlyMean[h] = arrayMean(hourValues);
    hourlyMax[h] = arrayMax(hourValues);
  }

  // Round all numeric outputs and use null for missing
  const roundedCount = roundAndUseNull(hourlyCount, 0);
  const roundedMin = roundAndUseNull(hourlyMin);
  const roundedMean = roundAndUseNull(hourlyMean);
  const roundedMax = roundAndUseNull(hourlyMax);

  return {
    hour: hour,
    count: roundedCount,
    min: roundedMin,
    mean: roundedMean,
    max: roundedMax,
  };
}
