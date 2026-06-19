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
 * @returns {{ datetime: Array.<DateTime>, x: Array.<number|null> }} - Arrays trimmed
 *   to full local calendar days. Timestamps remain in UTC. Both arrays are empty
 *   if the input contains fewer than one full local day.
 * @throws {Error} If `datetime` and `x` are not arrays of equal length.
 * @throws {Error} If `timezone` is not a string or is not a recognized IANA zone.
 * @throws {Error} If any entry in `datetime` is not a Luxon DateTime in UTC.
 * @example
 * // Series starting at 06:00 UTC (22:00 UTC-8 on the prior day) is trimmed to
 * // begin at the first local midnight boundary.
 * const { datetime, x } = trimDate(myDatetimes, myValues, "America/Los_Angeles");
 * // datetime[0].hour === 8  (08:00 UTC = 00:00 UTC-8)
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

  // Validate the timezone string by attempting a conversion and checking isValid.
  // Luxon's setZone() silently falls back to UTC for unrecognized zone names, so
  // we must check explicitly rather than relying on a thrown exception.
  if (datetime.length > 0 && !datetime[0].setZone(timezone).isValid) {
    throw new Error(`trimDate: invalid or unrecognized timezone "${timezone}".`);
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
