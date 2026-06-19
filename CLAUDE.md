# CLAUDE.md

AI-oriented project guide for `air-monitor-algorithms`. Read this first, then
consult the two companion documents as needed:

- **`.claude/CLAUDE_ARCHITECTURE.md`** — architecture, module map, call graph,
  public API contract, and design rationale.
- **`.claude/CLAUDE_STYLE_GUIDE.md`** — cross-project working principles
  (philosophy, refactoring, error handling, communication, review priorities).
  These are portable conventions shared across projects.

This file covers *conventions for this project*. The architecture doc
details *how this project works*; the style guide governs
*how we write code*.

---

## Project Overview

`air-monitor-algorithms` is a JavaScript library of algorithms for processing
hourly time series data, with an initial focus on air quality monitoring
applications.

Features:

- Distributed as an ES module (also bundled as UMD for `require('...')`).
- High-level analysis functions: `dailyStats`, `diurnalStats`, `pm_nowcast`, `trimDate`.
- Array utility functions: `arrayCount`, `arraySum`, `arrayMin`, `arrayMean`, `arrayMax`,
  `useNull`, `roundAndUseNull`.
- Quality-control utility: `QC_negativeValues`.
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

## JavaScript Style

- Use modern ES6 JavaScript.
- Use ESM (`import` / `export`) syntax.
- Prefer async/await over promise chains.
- Prefer descriptive variable and function names.
- Prefer small functions with clear responsibilities.
- Avoid introducing dependencies unless they provide significant value.
  (The only runtime dependency is Luxon, and that should remain true unless
  there is a strong reason otherwise.)

Public functions should carry JSDoc documenting parameters, return values, and
units. See `.claude/CLAUDE_STYLE_GUIDE.md` for the general documentation
philosophy.

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

Do not change these conventions, as they are relied upon
throughout the package and by downstream consumers.

### Public API and Compatibility

This is a published npm package consumed by other projects.

Be conservative when modifying:

- Exported function names and signatures
- Function return shapes (e.g. the structure of `dailyStats` / `diurnalStats` results)
- Units, rounding behavior, and missing-value handling

Preserve backward compatibility whenever practical. Breaking changes warrant a
deliberate version bump and a note in `NEWS.md`. See the "Public API Contract"
section of `.claude/CLAUDE_ARCHITECTURE.md` for the full contract.

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

Prioritize and communicate recommendations as described in
`.claude/CLAUDE_STYLE_GUIDE.md` (Review Priorities and Communication Style).
Do not assume a rewrite is desired.
