import moment from "moment-timezone";
import { trimDate } from "./trimDate.js";

/**
 * Calculates diurnal averages for the time series specified by `datetime` and `x`.
 *
 * The returned object contains two properties:
 * * hour -- Array of local time hours [0-24]
 * * avg -- Array of time-of-day averages for each hour
 *
 * By default, the averages are calculated using data from the most recent 7 days
 * in the `datetime` array.
 * @param {...Date} datetime Regular hourly axis representing the time associated
 * with each measurement.
 * @param {...Number} x Array of hourly measurements.
 * @param {string} timezone Olson time zone to use as "local time".
 * @param {Number} dayCount Number of days to use.
 * @returns {...Number} Array of local time daily averages.
 */
export function diurnalAverage(datetime, x, timezone, dayCount = 7) {
  // Start by trimming to full days in the local timezone
  let trimmed = trimDate(datetime, x, timezone);

  let fullDayCount = trimmed.datetime.length / 24;
  dayCount = fullDayCount < dayCount ? fullDayCount : dayCount;

  let localTime = datetime.map((o) => moment.tz(o, timezone));
  let hours = localTime.map((o) => o.hours());

  let hour = [];
  let hourly_avg = [];

  // For each hour, average together the contributions from each day
  for (let h = 0; h < 24; h++) {
    let sum = 0;
    for (let d = 0; d < dayCount; d++) {
      sum += x[h + d * 24];
    }
    hour[h] = h;
    hourly_avg[h] = sum / dayCount;
  }

  // Round to one decimal place and ensure null is the missing value
  hourly_avg = hourly_avg.map((o) =>
    o === null || o === undefined || isNaN(o) ? null : Math.round(10 * o) / 10
  );

  return { hour: hour, avg: hourly_avg };
}
