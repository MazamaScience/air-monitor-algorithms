import { DateTime } from "luxon";

/**
 * Trim a time series to full local calendar days.
 *
 * Discards any partial days at the beginning or end of the array. Uses the local
 * time zone to determine day boundaries.
 *
 * @param {Array.<Date|DateTime>} datetime - Array of Date or Luxon DateTime objects (hourly).
 * @param {Array.<number>} x - Array of measurements (same length as datetime).
 * @param {string} timezone - IANA/Olson timezone (e.g. "America/Los_Angeles").
 * @returns {object} - Object with `datetime` and `x` arrays trimmed to full days.
 */
export function trimDate(datetime, x, timezone) {
  if (!Array.isArray(datetime) || !Array.isArray(x) || datetime.length !== x.length) {
    throw new Error("datetime and x must be arrays of equal length.");
  }
  if (typeof timezone !== "string") {
    throw new Error("timezone must be a string.");
  }

  // Convert each timestamp to a Luxon DateTime in the target time zone
  const localHours = datetime.map((dt) => {
    if (DateTime.isDateTime(dt)) {
      return dt.setZone(timezone).hour;
    } else if (dt instanceof Date) {
      return DateTime.fromJSDate(dt, { zone: timezone }).hour;
    } else {
      throw new Error("datetime array must contain only Date or DateTime objects.");
    }
  });

  // Determine how many hours to trim from the beginning
  const start = localHours[0] === 0 ? 0 : 24 - localHours[0];

  // Determine how many hours to trim from the end
  const end = localHours[localHours.length - 1] === 23
    ? localHours.length
    : localHours.length - (localHours[localHours.length - 1] + 1);

  if (end <= start) {
    return { datetime: [], x: [] };
  }

  return {
    datetime: datetime.slice(start, end).map((d) =>
      DateTime.isDateTime(d) ? d.toJSDate() : d
    ),
    x: x.slice(start, end),
  };
}
