# air-monitor-algorithms 1.4.2

- Fixed `pm_nowcast` returning `null` for all-zero input (division by zero in
  NowCast weight formula when all values are identical).
- Fixed `trimDate` silently producing wrong results for invalid IANA timezone
  strings; it now throws with a descriptive error.
- Fixed `nowcastPM` double-rounding (internal `toFixed` redundant with
  `roundAndUseNull` in caller).
- `diurnalStats` now uses shared array utility functions (`arrayMin`, `arrayMax`,
  `arrayMean`, `arrayCount`) instead of inline accumulation, consistent with
  `dailyStats`; also applies `roundAndUseNull` to `count`.
- Added 11 new tests (invalid timezone, all-zero NowCast, invalid `qc`
  parameter, non-array NowCast input); removed fully-commented
  `interactive_tests.js`.
- JSDoc fixes: corrected `dailyStats` returned-datetime timezone label; added
  `@throws` to `trimDate`; corrected `@param` types for `x` and `roundAndUseNull`;
  documented `diurnalStats` `dayCount` clamping and `trimDate` return shape.
- `CLAUDE.md`: added `useNull` and `roundAndUseNull` to exported-utilities list.
- `README.md`: `npm run test` → `npm test`; clarified `arrayCount` description.

# air-monitor-algorithms 1.4.1

- Reorganized documentation: split `CLAUDE.md` into project-specific guide,
  portable `.claude/CLAUDE_STYLE_GUIDE.md`, and moved architecture notes into
  `.claude/CLAUDE_ARCHITECTURE.md`.
- Merged `README_dev.md` into `README.md`; added Examples section.
- Consolidated `.claude/commands/` from 7 files to 5 (`initial-project-review`,
  `code-review`, `documentation-review`, `wrap-up`, `pre-publish`).
- Fixed stale `qcType` references in JSDoc comments and error messages
  (renamed to `QC_negativeValues` in 1.4.0 but not fully updated in source).

# air-monitor-algorithms 1.4.0

- **Breaking:** Renamed `qcType()` to `QC_negativeValues()` (signature and
  behavior unchanged).
- Removed the unused Babel toolchain (no effect on the published bundles).
- Renamed `examples/test.html` to `examples/visual.html`; fixed the
  `examples/basic.html` title.

# air-monitor-algorithms 1.3.1

- Added `@example` JSDoc blocks to all public functions.
- Improved Claude Code configuration (`.claude/settings.json` permissions,
  `.claude/commands/` slash commands, `wrap-up` checklist).
- Removed stale `.claude/launch.json` and `CLAUDE_REVIEW.md`.

# air-monitor-algorithms 1.3.0

- Added `qcType(x, type)` negative-value QC utility (modes `"keep"` and
  `"drop"`).
- `dailyStats` and `diurnalStats` accept an optional `qc` argument
  (default `"keep"`) applied before computing statistics.

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
