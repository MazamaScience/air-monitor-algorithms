# CLAUDE_REVIEW.md
# Project Review & Improvement Suggestions — air-monitor-algorithms

**Date:** 2026-06-09
**Scope:** Review of current design, identification of correctness/risk issues,
a prioritized list of low-risk improvements, and a proposed fix for the one
confirmed bug. Generated from the `review-project.md`, `suggest-improvements.md`,
and `propose-fix.md` prompts.

> Status: review only. No source files have been modified. The proposed fix in
> Section 3 is awaiting maintainer approval.

---

## 1. Project Review

### Design Summary

**Purpose.** `air-monitor-algorithms` is a pure-computation JavaScript library
for processing regular hourly time series, focused on air quality. No I/O, no
state, no side effects — arrays in, values / plain objects out.

**Structure & responsibilities (`src/`):**

| Module             | Responsibility |
|--------------------|----------------|
| `index.js`         | The only public surface; re-exports everything Rollup bundles. |
| `utils.js`         | Null-aware array primitives (`arrayMin/Max/Count/Sum/Mean`, `useNull`, `roundAndUseNull`). No dependencies. |
| `trimDate.js`      | Trims a series to full local calendar days; the strict input validator; only module importing Luxon. |
| `dailyStats.js`    | Per-day min/mean/max/count; builds on `trimDate` + `utils`. |
| `diurnalStats.js`  | Hour-of-day stats over recent days; builds on `trimDate` + `utils`. |
| `nowcast.js`       | EPA NowCast weighted average; builds on `roundAndUseNull`. |

**Execution flow / data movement.** Caller passes parallel `datetime[]` (UTC
Luxon `DateTime`) and `x[]` arrays → `trimDate` validates and aligns to full
local days → `dailyStats` / `diurnalStats` slice into 24-hour blocks and reduce
via the `utils` primitives → results rounded by `roundAndUseNull`, missing values
normalized to `null`.

**External dependencies.** One runtime dependency: Luxon 3.6.1. Dev tooling:
Rollup, Babel, uvu, JSDoc. CI runs `npm test` on push/PR to `main`.

**Assumptions / constraints.** Regular hourly axis, no gaps; missing = `null`;
timestamps are UTC Luxon `DateTime` in and out; local time requested via explicit
IANA `timezone`; each local day assumed to be exactly 24 values.

### Findings by Priority

#### 🔴 High — Correctness

**H1. `diurnalStats` returns `null` for `max` when all values at an hour are ≤ 0.**
`src/diurnalStats.js:59` initializes `let max = Number.MIN_VALUE`. `Number.MIN_VALUE`
is the smallest *positive* double (~5e-324), **not** the most-negative number. Any
value `≤ 0` never satisfies `value > max`, and the sentinel check
`max === Number.MIN_VALUE ? null : max` then returns `null`. Confirmed by repro:

```
ALL ZERO -> min[0]: 0   max[0]: null  mean[0]: 0   count[0]: 3
ALL -5   -> min[0]: -5  max[0]: null  mean[0]: -5  count[0]: 3
```

This bites real air-quality data: PM2.5 can legitimately read `0` (clean air,
often overnight) — that hour's `max` silently becomes `null` while
`min`/`mean`/`count` are valid. Existing tests miss it because every fixture uses
positive values. Detailed fix in Section 3.

#### 🟠 Medium

**M1. DST days break the 24-hour slicing assumption.** `dailyStats` /
`diurnalStats` compute `length / 24` and slice fixed 24-value blocks. A local day
with 23 or 25 hours (DST transition) drifts the alignment for all subsequent days.
Acceptable today but undocumented and latent.

**M2. `dailyStats.js:6` imports `useNull` but never uses it.** Dead import — minor
confusion, trivial lint failure risk.

#### 🟡 Low / Documentation

- **L1.** `src/index.js:2` header comment says `v1.0.4`; package is `1.2.7`. Stale.
- **L2.** `diurnalStats` uses a hand-rolled sentinel reduction while `dailyStats`
  uses the clean `arrayMin/Max/Mean/Count` helpers — inconsistent, and the
  inconsistency is exactly what hides H1.
- **L3.** `pm_nowcast` of all-zero input returns `null` (0/0 → NaN internally)
  rather than `0` — debatable, undocumented edge case.
- **L4.** `roundAndUseNull` / `useNull` are exported but absent from the README
  feature list.
- **L5.** No `.d.ts`; typed consumers rely on JSDoc only.

---

## 2. Improvement Suggestions

Ten small, low-risk tasks, favoring reliability / clarity / docs / maintenance:

| #  | Title | Why valuable | Effort | Risk |
|----|-------|--------------|--------|------|
| 1  | Fix `max` sentinel in `diurnalStats` (H1) | Eliminates silent wrong `null` for zero/negative hours — a real correctness bug | Small | Low |
| 2  | Add regression tests for zero & negative data | Locks in the H1 fix; current fixtures are all positive | Small | Low |
| 3  | Remove unused `useNull` import in `dailyStats.js` (M2) | Clarity; avoids lint noise | Small | Low |
| 4  | Refactor `diurnalStats` to reuse `arrayMin/Max/Mean/Count` (L2) | Consistency with `dailyStats`; removes the sentinel class of bugs | Medium | Low |
| 5  | Update stale `v1.0.4` header in `index.js` (L1) | Avoids misleading version info | Small | Low |
| 6  | Document the 24-hour / DST assumption (M1) | Sets correct expectations for maintainers/consumers | Small | Low |
| 7  | Document `roundAndUseNull` & `useNull` in README (L4) | Completes public API docs | Small | Low |
| 8  | Define & test `pm_nowcast([0,0,…])` behavior (L3) | Removes an ambiguous edge case | Small | Low |
| 9  | Add a `lint`/`format` script (e.g. ESLint/Prettier) | Catches dead imports (M2) and style drift automatically | Medium | Low |
| 10 | Add minimal JSDoc `@example` blocks to each public fn | Improves generated docs for non-engineer consumers | Small | Low |

---

## 3. Proposed Fix for H1

> No files have been modified. Awaiting maintainer approval.

**1. The issue & why it matters.** `diurnalStats` returns `max = null` for any
hour whose valid values are all `≤ 0`, even though `count`, `min`, and `mean` are
correct. Real PM2.5 data hits `0`, so consumers can get a spurious `null` max for
clean overnight hours — corrupting plots/summaries with no error raised.

**2. Root cause.** `src/diurnalStats.js:59` seeds `let max = Number.MIN_VALUE`,
mistaking it for a large-negative sentinel. It is actually ~5e-324 (smallest
positive double), so the comparison `values[index] > max` never updates `max` for
non-positive values, and the post-loop check
`max === Number.MIN_VALUE ? null : max` (line 78) then yields `null`.

**3. Smallest reasonable fix.** Stop using value sentinels; use the
already-computed `count` to decide emptiness. Two-line change:

- `src/diurnalStats.js:59`: `let max = Number.MIN_VALUE;` → `let max = -Infinity;`
- `src/diurnalStats.js:77-78`: gate min/max on `count` instead of sentinel equality:

  ```js
  hourlyMin[h] = count === 0 ? null : min;
  hourlyMax[h] = count === 0 ? null : max;
  ```

  (`min`'s `Number.MAX_VALUE` seed is harmless, but switching its emptiness check
  to `count === 0` makes the pair consistent and correct.)

**4. Why preferable.** Minimal diff, no API/return-shape change, no new dependency,
preserves all existing behavior for positive data (39 tests stay green). `count`
is already the authoritative "did we see any valid value" signal, so it is more
robust than any value sentinel. A larger refactor (task #4 — reuse
`arrayMin/Max`) is cleaner long-term but is a bigger change and should be kept
separate.

**5. Risks / edge cases / operational impact.** Very low. `-Infinity` /
`MAX_VALUE` seeds can never appear in output once gated on `count`. No downstream
contract changes. Should be paired with task #2 (tests for all-zero and
all-negative hours) to prevent regression.

**6. Files to modify.**

- `src/diurnalStats.js` (the fix)
- `tests/diurnalStats.test.js` (regression tests)
- `dist/*` would only change on the next `npm run build` — not edited by hand.
