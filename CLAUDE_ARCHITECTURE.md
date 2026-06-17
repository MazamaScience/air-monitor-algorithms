# CLAUDE_ARCHITECTURE.md
# Architecture Notes — air-monitor-algorithms

This document is maintained as a reference for human maintainers and as context
for AI assistants working on this codebase. Source code, JSDoc comments, and
human-reviewed release notes (`NEWS.md`) remain authoritative.

---

## FOR HUMANS

### Purpose and Scope

`air-monitor-algorithms` is a small, dependency-light JavaScript library of
algorithms for processing hourly time series data, with an initial focus on air
quality monitoring. It provides:

- High-level analysis functions: `dailyStats`, `diurnalStats`, `pm_nowcast`, `trimDate`.
- Array utility functions: `arrayCount`, `arraySum`, `arrayMin`, `arrayMean`, `arrayMax`.

It is a **pure computation library**: no I/O, no network access, no persistent
state, no side effects. Functions take arrays in and return values or plain
objects out. It is distributed as an npm package and as browser-loadable bundles.

**What it does not do:**
- It does not fetch, store, or cache data (callers supply the arrays).
- It does not handle irregular time axes — all series are assumed to be on a
  regular hourly axis with no gaps.
- It does not perform timezone-naive date math (Luxon `DateTime` in UTC is required).
- It does not bundle a runtime framework — it is plain ESM with one dependency.

### Relationship to Other AirFire / air-monitor Systems

This package is a building block in the
[air-monitor](https://github.com/MazamaScience/air-monitor) ecosystem, which
works with air quality archives hosted by the US Forest Service. The library has
**no service-to-service dependencies** of its own; it is consumed as a dependency
by higher-level packages and applications (including Svelte and Vue apps). The
function signatures and return shapes are therefore a public contract — see
"Public API Contract" below.

The only runtime dependency is **Luxon** (`luxon` 3.6.1), used for all
date-and-time handling.

### Distribution and Installation

The package is published to npm as `air-monitor-algorithms`.

- Stable release: `npm install air-monitor-algorithms`
- Development version: `npm install github:MazamaScience/air-monitor-algorithms`

`package.json` is the single source of truth for the version number, and the
`"files"` field controls what is published (`dist`, `src`, `README.md`, `LICENSE`).

Entry points (from `package.json`):

| Consumer            | Field / condition | File                                   |
|---------------------|-------------------|----------------------------------------|
| ESM `import`        | `module` / `import` | `dist/air-monitor-algorithms.esm.js` |
| CommonJS `require`  | `main` / `require`  | `dist/air-monitor-algorithms.umd.js` |
| Browser global      | UMD `name`          | `AirMonitorAlgorithms`               |

---
---

## FOR AI

The sections below provide architectural context to help AI assistants understand
how this codebase is structured, why it is designed the way it is, and how changes
in one area may affect others.

### Core Data Conventions

These conventions are foundational and are relied upon by every function in the
package as well as by downstream consumers. Treat them as load-bearing:

1. **Regular hourly axis, no gaps.** All time series are assumed to be evenly
   spaced at one-hour intervals. Day-boundary logic (`trimDate`) and the
   24-values-per-day slicing in `dailyStats` / `diurnalStats` depend on this.
2. **Missing values are `null`.** Not `NaN`, not `undefined`. The `useNull()`
   helper normalizes any non-finite value to `null` at function boundaries.
3. **Timestamps are Luxon `DateTime` objects in UTC** — on both input and output.
   `trimDate` actively validates this and throws if violated.
4. **Local time is requested explicitly.** Functions that produce local-time
   results (`dailyStats`, `diurnalStats`, `trimDate`) take an explicit IANA
   `timezone` argument and never rely on the system timezone.
5. **Numeric outputs are rounded via `roundAndUseNull()`** — counts to 0 decimals,
   everything else to 1 decimal — and invalid results become `null`.

### Module Map

All source lives in `src/`. Each module is small and single-purpose:

| Module              | Exports                                   | Role |
|---------------------|-------------------------------------------|------|
| `src/index.js`      | (re-exports everything)                   | Public API surface; the only entry Rollup bundles. |
| `src/utils.js`      | `arrayMin/Max/Count/Sum/Mean`, `useNull`, `roundAndUseNull`, `QC_negativeValues` | Array primitives; null-aware stats; negative-value QC. No dependencies. |
| `src/trimDate.js`   | `trimDate`                                | Trims a series to full local calendar days. Only module that imports Luxon directly. |
| `src/dailyStats.js` | `dailyStats`                              | Per-day min/mean/max/count. Builds on `trimDate` + `utils`. |
| `src/diurnalStats.js`| `diurnalStats`                           | Hour-of-day averages over recent days. Builds on `trimDate` + `utils`. |
| `src/nowcast.js`    | `pm_nowcast` (+ private `nowcastPM`)      | EPA NowCast weighted average. Builds on `roundAndUseNull`. |

### Dependency / Call Graph

```
index.js ──exports──▶ all public functions

trimDate.js ──imports──▶ luxon (DateTime)

dailyStats.js   ──┬─▶ trimDate.js
                  └─▶ utils.js (arrayCount/Min/Mean/Max, roundAndUseNull, qcType)

diurnalStats.js ──┬─▶ trimDate.js
                  └─▶ utils.js (roundAndUseNull, qcType)

nowcast.js ───────────▶ utils.js (roundAndUseNull)
```

`trimDate` is the shared foundation for both `dailyStats` and `diurnalStats`:
both call it first to align data to full local days before doing 24-hour slicing.
A change to `trimDate`'s trimming logic affects both.

### Key Design Decisions

**`index.js` is the single public surface.**
Rollup bundles `src/index.js` only. Anything not re-exported there (e.g. the
private `nowcastPM` helper) is internal and may change freely. Adding a public
function means adding both the implementation module and an export in `index.js`.

**Null-aware array primitives are centralized in `utils.js`.**
`arrayMin/Max/Count/Sum/Mean` all funnel through `useNull()` so that missing-value
handling is defined in exactly one place. Higher-level functions reuse these
rather than re-implementing null handling. `arrayMean` is built on `arraySum`.

**`trimDate` owns input validation; downstream functions trust it.**
`trimDate` is the strict gatekeeper: it throws on mismatched array lengths,
non-`DateTime` entries, or non-UTC timestamps. Because `dailyStats` and
`diurnalStats` call `trimDate` first, they do not re-validate those invariants —
they instead guard against *insufficient* data (see below).

**"Insufficient data returns empty, bad input throws."**
Two distinct failure modes are handled differently and deliberately:
- *Malformed input* (wrong types, non-UTC, unequal lengths) → **throw** (in `trimDate`,
  and a type check in `pm_nowcast`).
- *Valid but insufficient* data (fewer than 24 aligned values) → **return empty
  arrays** in the same shape, so callers can map over results without special-casing.

**The NowCast algorithm is a faithful EPA port and is commented as such.**
`nowcast.js` implements EPA's exponentially-weighted NowCast over a 12-hour
rolling window, including its quirks: values are reversed into reverse-chronological
order, `null` is converted to `NaN` (because `null * 1 === 0` would corrupt the
weighting), and a minimum of 2 valid values in the most recent 3 hours is required
or the result is `null`. These are correctness-critical; preserve the intent and
keep the explanatory comments.

### Public API Contract

Because this is a published package consumed by other projects, the following are
effectively a contract. Changing any of them is a breaking change warranting a
deliberate version bump and a `NEWS.md` entry:

- Exported function **names and parameter signatures**.
- The **return shapes** of `dailyStats` (`{ datetime, count, min, mean, max }`)
  and `diurnalStats` (`{ hour, count, min, mean, max }`) — parallel arrays.
- **Units, rounding behavior, and null semantics** of returned values.
- The requirement that timestamp inputs/outputs are **UTC Luxon `DateTime`** objects.

Historical note: in 1.0.3 the older `dailyAverage()` / `diurnalAverage()`
functions were replaced by the object-returning `dailyStats()` / `diurnalStats()`,
and in 1.2.0 all timestamps were standardized on Luxon UTC `DateTime`. The
moment-timezone → Luxon migration happened at the same time. These were the two
most significant API-shaping changes.

### Validation and Error Handling

| Condition                                            | Behavior                  | Where |
|------------------------------------------------------|---------------------------|-------|
| `datetime`/`x` not arrays or unequal length          | `throw Error`             | `trimDate.js` |
| `timezone` not a string                              | `throw Error`             | `trimDate.js` |
| Any `datetime` entry not a Luxon `DateTime`          | `throw Error`             | `trimDate.js` |
| Any `datetime` entry not in UTC zone                 | `throw Error`             | `trimDate.js` |
| Input to `pm_nowcast` not an array                   | `throw Error`             | `nowcast.js` |
| Fewer than 24 aligned hourly values                  | return empty result object| `dailyStats.js`, `diurnalStats.js` |
| Fewer than 2 valid values in most recent 3 hours     | return `null` for that NowCast | `nowcast.js` |
| Non-finite / missing numeric value                   | normalized to `null`      | `utils.js` (`useNull`) |
| Negative value (per `qc` mode, default `"keep"`)     | clamped to `0` or `null`  | `utils.js` (`QC_negativeValues`) |
| Invalid `qc` type passed to `QC_negativeValues`      | `throw Error`             | `utils.js` (`QC_negativeValues`) |

There is no logging layer; this is a library, so errors propagate to the caller
rather than being logged. Failures are surfaced loudly (thrown) or represented
explicitly as `null` — never silently swallowed.

### Build and Distribution

- **Bundler:** Rollup (`rollup.config.js`) produces two outputs from
  `src/index.js`, both minified with Terser and with sourcemaps:
  - `dist/air-monitor-algorithms.umd.js` — UMD, global `AirMonitorAlgorithms`
    (for browsers and Playwright).
  - `dist/air-monitor-algorithms.esm.js` — ES module (for modern bundlers/Node).
- **Command:** `npm run build`.
- `dist/` is a **build artifact directory** — do not hand-edit it. Regenerate it.
- Babel (`.babelrc`, `@babel/preset-env`) is present for transpilation tooling.
- `package.json` version is the single source of truth for the published version.

### Testing

- **Framework:** [uvu](https://github.com/lukeed/uvu), run via `npm test`.
- Test files live in `tests/`, one per source module
  (`utils.test.js`, `trimDate.test.js`, `dailyStats.test.js`,
  `diurnalStats.test.js`, `nowcast.test.js`), plus `interactive_tests.js`
  for manual exploration.
- **CI:** `.github/workflows/test.yml` runs `npm test` on pushes and PRs to
  `main`, using Node `lts/*`.
- New or changed behavior should be accompanied by tests in the matching file.

### Documentation

- **JSDoc** generates HTML docs into `docs/` via `npm run docs`
  (config in `jsdoc.conf.json`; `README.md` is used as the docs landing page).
- Public functions carry JSDoc with `@param`/`@returns` and unit descriptions.
- Developer workflow hints live in `README_dev.md`; a runnable browser demo is
  in `examples/basic.html`.

### Known Limitations and Future Work

- **No partial-day or `minCount` support in `dailyStats`.** Days with fewer than
  24 hours of data are dropped by `trimDate`, and daily stats are computed over
  fixed 24-value slices. A `TODO` in `dailyStats.js` notes the intent to support
  a configurable minimum valid count and partial days.
- **DST handling.** Day-boundary logic assumes 24 hours per local day. Days with
  23 or 25 hours (DST transitions) are not specially handled; this is acceptable
  for current use but worth noting before relying on it across DST boundaries.
- **No TypeScript types.** The package ships JSDoc-annotated JavaScript without
  `.d.ts` declarations; typed consumers infer types from JSDoc only.
- **Single runtime dependency by design.** Keep it that way — Luxon should remain
  the only runtime dependency unless there is a compelling reason otherwise.
