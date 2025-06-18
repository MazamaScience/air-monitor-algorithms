import moment from "moment-timezone";

/**
 * Trim a time series to full local calendar days.
 *
 * Discards any partial days at the beginning or end of the array. Uses the local
 * time zone to determine day boundaries.
 *
 * @param {Array.<Date>} datetime - Array of Date objects (hourly).
 * @param {Array.<number>} x - Array of measurements (same length as datetime).
 * @param {string} timezone - IANA/Olson timezone (e.g. "America/Los_Angeles").
 * @returns {object} - Object with `datetime` and `x` arrays trimmed to full days.
 */
export function trimDate(datetime, x, timezone) {
  // Validate inputs
  if (!Array.isArray(datetime) || !Array.isArray(x) || datetime.length !== x.length) {
    throw new Error("datetime and x must be arrays of equal length.");
  }
  if (typeof timezone !== "string") {
    throw new Error("timezone must be a string.");
  }

  // Convert each UTC timestamp to a local time object
  const localTime = datetime.map((o) => moment.tz(o, timezone));

  // Get the hour (0–23) for each timestamp in local time
  const hours = localTime.map((o) => o.hours());

  // Determine how many hours to trim from the beginning
  const start = hours[0] === 0 ? 0 : 24 - hours[0];

  // Determine how many hours to trim from the end
  const end = hours[hours.length - 1] === 23
    ? hours.length
    : hours.length - (hours[hours.length - 1] + 1);

  // Handle case where no full days exist
  if (end <= start) {
    return { datetime: [], x: [] };
  }

  // Slice both arrays to only include full local days
  const trimmed_datetime = datetime.slice(start, end);
  const trimmed_x = x.slice(start, end);

  return {
    datetime: trimmed_datetime,
    x: trimmed_x,
  };
}
