import { trimDate } from "./trimDate.js";
import { roundAndUseNull, qcType } from "./utils.js";

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
 * @param {string} qc - Negative-value QC mode passed to qcType: "keep"
 *   (clamp small negatives to 0, drop values below -10) or "drop" (drop all
 *   negatives). Default: "keep".
 * @returns {object} - Object with hour, count, min, mean, and max arrays.
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
  dayCount = fullDayCount < dayCount ? fullDayCount : dayCount;
  const startIndex = trimmed.datetime.length - dayCount * 24;

  // Apply the negative-value QC pass and mark valid values. The qc mode
  // controls how negatives are handled (see qcType); "keep" clamps small
  // negatives to 0 and drops values below -10 as missing.
  const values = qcType(trimmed.x, qc);
  const validFlags = values.map((v) => (v === null ? 0 : 1));

  const hour = [];
  const hourlyCount = [];
  const hourlyMin = [];
  const hourlyMean = [];
  const hourlyMax = [];

  // For each hour of the day (0–23), compute stats across days
  for (let h = 0; h < 24; h++) {
    let min = Number.MAX_VALUE;
    let max = -Infinity;
    let count = 0;
    let sum = null;

    for (let d = 0; d < dayCount; d++) {
      const index = startIndex + h + d * 24;

      if (validFlags[index] === 1) {
        // Values have already been QC'd by qcType above, so every valid value
        // here is non-negative (or was dropped to null and skipped).
        const value = values[index];

        if (sum === null) sum = 0;

        min = value < min ? value : min;
        max = value > max ? value : max;
        sum += value;
        count += 1;
      }
    }

    hour[h] = h;
    hourlyMin[h] = count === 0 ? null : min;
    hourlyMax[h] = count === 0 ? null : max;
    hourlyCount[h] = count;
    hourlyMean[h] = sum === null ? null : sum / count;
  }

  // Round all numeric outputs and use null for missing
  const roundedMin = roundAndUseNull(hourlyMin);
  const roundedMean = roundAndUseNull(hourlyMean);
  const roundedMax = roundAndUseNull(hourlyMax);

  return {
    hour: hour,
    count: hourlyCount,
    min: roundedMin,
    mean: roundedMean,
    max: roundedMax,
  };
}
