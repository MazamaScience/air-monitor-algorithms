/**
 * air-monitor-algorithms v1.0.4
 *
 * Scientific algorithms for analyzing hourly environmental sensor data,
 * especially air quality measurements.
 *
 * This package depends on Luxon for date-time handling.
 *
 * 🚨 All timestamp inputs must be Luxon `DateTime` objects in the UTC timezone.
 * 🚨 All timestamp outputs are returned as Luxon `DateTime` objects in UTC.
 *
 * Example:
 *   import { dailyStats } from 'air-monitor-algorithms';
 *   const result = dailyStats(datetimeArray, valueArray, "America/Los_Angeles");
 *
 * Modules exported:
 * - dailyStats()     → Calculate daily summaries (min, max, mean, count)
 * - diurnalStats()   → Calculate hourly averages over multiple days
 * - pm_nowcast()     → EPA PM2.5 NowCast implementation
 * - trimDate()       → Utility to trim time series to full local calendar days
 * - array utilities  → arrayMin, arrayMax, arraySum, arrayMean, etc.
 */

// High-level algorithms
export { dailyStats } from "./dailyStats.js";
export { diurnalStats } from "./diurnalStats.js";
export { pm_nowcast } from "./nowcast.js";


// Date utilities
export { trimDate } from "./trimDate.js";

// Array utilities
export {
  arrayMin,
  arrayMax,
  arrayCount,
  arraySum,
  arrayMean,
  roundAndUseNull,
  useNull,
} from "./utils.js";
