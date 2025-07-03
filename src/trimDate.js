import { DateTime } from "luxon";

/**
 * Trim a time series to full local calendar days.
 *
 * Discards any partial days at the beginning or end of the array. Uses the local
 * time zone to determine day boundaries, but always returns timestamps in UTC.
 *
 * @param {Array.<DateTime>} datetime - Array of Luxon DateTime objects (in UTC).
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

  for (const dt of datetime) {
    if (!DateTime.isDateTime(dt)) {
      throw new Error("All entries in datetime must be Luxon DateTime objects.");
    }
    if (dt.zoneName !== "UTC") {
      throw new Error("All datetime values must be in the UTC time zone.");
    }
  }

  // Convert to local hours
  const localHours = datetime.map((dt) => dt.setZone(timezone).hour);

  // Determine how many entries to trim from start
  const start = localHours[0] === 0 ? 0 : 24 - localHours[0];

  // Determine how many entries to keep up to the last full hour of a full day
  const lastHour = localHours[localHours.length - 1];
  const end = lastHour === 23 ? localHours.length : localHours.length - (lastHour + 1);

  if (end <= start) {
    return { datetime: [], x: [] };
  }

  return {
    datetime: datetime.slice(start, end),
    x: x.slice(start, end),
  };
}
