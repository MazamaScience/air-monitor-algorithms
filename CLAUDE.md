# CLAUDE.md

## Project Overview

This project is `air-monitor-algorithms`, a JavaScript library of algorithms for
processing hourly time series data, with an initial focus on air quality
monitoring applications.

Features:

- Distributed as an ES module (also bundled as UMD for `require`).
- High-level analysis functions: `dailyStats`, `diurnalStats`, `pm_nowcast`, `trimDate`.
- Array utility functions: `arrayCount`, `arraySum`, `arrayMin`, `arrayMean`, `arrayMax`.
- Published to npm and consumed by the
  [air-monitor](https://github.com/MazamaScience/air-monitor) ecosystem.
- Built with Rollup, tested with uvu, documented with JSDoc.

The primary goals of this project are:

- Correctness of scientific calculations
- Reliability
- Operational transparency
- Maintainability
- Simplicity

This project is a building block in operational air quality infrastructure.
Correctness and robustness are more important than architectural sophistication.

---

## Known Preferences of the Maintainer

The maintainer values clarity, correctness, and long-term maintainability over
novelty or abstraction.

### General Philosophy

- Prefer simple, understandable code over clever solutions.
- Favor maintainability over optimization unless performance is a demonstrated problem.
- Prefer explicit code over metaprogramming or excessive abstraction.
- Small, incremental improvements are preferred over large rewrites.
- Existing working code should be respected and changed conservatively.
- Avoid introducing complexity unless there is a clear scientific or operational benefit.

### JavaScript Style

- Use modern ES6 JavaScript.
- Use ESM (`import` / `export`) syntax.
- Prefer async/await over promise chains.
- Prefer descriptive variable and function names.
- Prefer small functions with clear responsibilities.
- Avoid introducing dependencies unless they provide significant value.
  (The only runtime dependency is Luxon, and that should remain true unless
  there is a strong reason otherwise.)

### Documentation and Comments

- Write code for future maintainers.
- Public functions should have clear JSDoc documentation describing parameters,
  return values, and units.
- Include explanatory comments describing intent, not just implementation.
- For scientific algorithms (e.g. the EPA NowCast formula), document the
  reasoning and any external specifications the code follows.
- Many consumers are scientists and operational staff who are not professional
  software engineers. Code readability and clear documentation are therefore
  especially important.

### Refactoring

- Do not propose architectural rewrites unless specifically requested.
- Preserve existing behavior unless a bug or design issue has been identified.
- When suggesting refactoring, explain the expected benefit.
- Prefer minimal diffs that are easy to review.
- Small improvements are generally preferred over large rewrites.

### Error Handling

- Failures should be detected and reported clearly.
- Avoid silent failures.
- Error messages should provide useful context (e.g. validate input types and
  explain what was expected).
- Reliability is more important than elegance.

### Communication Style

- Explain recommendations before making substantial changes.
- Distinguish between required fixes and optional improvements.
- Identify risks and tradeoffs.
- Rank recommendations by priority.
- Do not assume a rewrite is desired.

---

## Project-Specific Constraints

### Date and Time Handling

- Use Luxon for all date and time operations.
- All timestamp **inputs** must be Luxon `DateTime` objects in the UTC timezone.
- All timestamp **outputs** are returned as Luxon `DateTime` objects in UTC.
- Avoid mixing Luxon `DateTime` objects and native JavaScript `Date` objects.
- Be explicit about timezones rather than relying on system defaults. Functions
  that produce local-time results take an explicit IANA `timezone` argument.

### Data Conventions

Several assumptions are foundational and should be preserved:

- All time series data are assumed to be on a regular hourly axis with no gaps.
- Missing values are represented as `null`, not `NaN` or `undefined`.
- Utility functions ignore missing values when computing statistics.

Be conservative when changing these conventions, as they are relied upon
throughout the package and by downstream consumers.

### Public API and Compatibility

This is a published npm package consumed by other projects.

Be conservative when modifying:

- Exported function names and signatures
- Function return shapes (e.g. the structure of `dailyStats` / `diurnalStats` results)
- Units, rounding behavior, and missing-value handling

Preserve backward compatibility whenever practical. Breaking changes warrant a
deliberate version bump and a note in `NEWS.md`.

### Build, Test, and Documentation

- Source lives in `src/`; the published bundles are generated into `dist/`.
- `npm run build` — bundle with Rollup.
- `npm run test` — run the uvu test suite in `tests/`.
- `npm run docs` — generate JSDoc documentation.
- New or changed behavior should be accompanied by tests.
- Do not hand-edit files in `dist/`; they are build artifacts.

---

## Review Expectations

When reviewing code:

1. Identify correctness issues, especially in scientific calculations.
2. Identify operational risks and backward-compatibility concerns.
3. Identify documentation gaps.
4. Suggest low-risk improvements.

Prioritize recommendations in this order:

1. Correctness
2. Reliability
3. Maintainability
4. Readability
5. Performance

Performance optimizations should generally be proposed only after correctness
and maintainability concerns have been addressed.

Do not assume a rewrite is desired.
