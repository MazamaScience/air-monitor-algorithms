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
