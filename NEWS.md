# air-monitor-algorithms 1.3.0

- Added `qcType(x, type)` utility to apply a negative-value quality-control
  pass. Mode `"keep"` clamps small negatives in `[-10, 0)` to `0` and drops
  values below `-10` to `null`; mode `"drop"` sets all negatives to `null`.
- `dailyStats` and `diurnalStats` now accept an optional `qc` argument
  (default `"keep"`) and apply this QC pass before computing statistics.

# air-monitor-algorithms 1.2.7

- edge case bug fixes
- improved demonstration page

# air-monitor-algorithms 1.2.6

Finally sorted out npm publishing.

# air-monitor-algorithms 1.2.4

Version bump and docs/ rebuild.

# air-monitor-algorithms 1.2.3

Harmonization with other `air-monitor~` packages.

# air-monitor-algorithms 1.2.2

Creating .esm.js and .umd.js versions with rollup.

# air-monitor-algorithms 1.2.1

Fixed npm distribution to include src/ instead of dist/.

# air-monitor-algorithms 1.2.0

Refactoring to require luxon DateTime objects in UTC for all timestamps.

# air-monitor-algorithms 1.1.0

Refactoring for best practices and edge case handling. No changes to functionality.

# air-monitor-algorithms 1.0.3

- Replaced `dailyAverage()` and `diurnalAverage()` functions with `dailyStats()`
  and `diurnalStats()`. These new functions return an object properties for
  `datetime` or `hour` as well as `count`, `min`, `mean`, and `max`.
- Added array manipulation functions: `arrayCount()`, `arraySum()`, `arrayMin()`, `arrayMean()`, and `arrayMax()`.

# air-monitor-algorithms 1.0.2

- Restructured the directory to put all source code in a `src/` directory.
- Now generating documentation using `jsdoc`.

# air-monitor-algorithms 1.0.1

Initial release includes the following algorithms:

- `dailyAverage()` -- Creates daily averages for the specified time zone.
- `diurnalStats()` -- Creates hour-of-day averages for the specified time zone.
- `nowcast()` -- Returns an array of NowCast values derived from the incoming time series.
- `trimDate()` -- Trims time series data to complete days in the specified time zone.
