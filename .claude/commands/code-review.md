---
description: Comprehensive project-wide code review covering scientific correctness, data conventions, test coverage, API stability, and documentation. Run before any version bump.
allowed-tools: Read, Bash
---

Please conduct a comprehensive code review of this project.

## Scope

Review the entire codebase as a cohesive system:

- **Source:** `src/` — all modules (index.js, utils.js, trimDate.js, dailyStats.js, diurnalStats.js, nowcast.js)
- **Tests:** `tests/` — all test files
- **Examples:** `examples/` — browser-based examples
- **Architecture:** Reference `.claude/CLAUDE_ARCHITECTURE.md` for module dependencies, design decisions, and the "bad input throws, insufficient data returns empty" philosophy
- **Style:** Reference `.claude/CLAUDE_STYLE_GUIDE.md` and `CLAUDE.md` for review priorities and communication expectations

## Critical Areas for This Project

This is a **published npm package** for scientific algorithms (air quality monitoring). Correctness and reliability are more important than elegance or optimization.

### Scientific Correctness & Algorithms

- Is the **EPA NowCast algorithm** faithful to EPA intent? (Check that the comments explain the quirks: reversal, NaN handling, 3-hour minimum, weighting formula.)
- Are **daily and diurnal aggregation calculations** correct? (Do they properly handle timezone boundaries, midnight alignment, and 24-hour slicing?)
- Is the **QC_negativeValues logic** correct for both modes ("keep" clamps [-10, 0) to 0 and drops below -10; "drop" removes all negatives)?
- Do **rounding semantics** match intent? (counts to 0 decimals, other values to 1 decimal — is this documented and tested?)

### Data Conventions (Load-Bearing)

These are foundational assumptions relied upon by all functions and downstream consumers:

- Are **hourly axis assumptions** preserved? (Code assumes regular 1-hour intervals; no gaps.)
- Is **null semantics** consistent? (Missing values are always `null`, never `NaN` or `undefined`; `useNull()` is the gateway.)
- Are **UTC timestamps** enforced? (All inputs/outputs are Luxon `DateTime` in UTC; `trimDate` validates this.)
- Is **timezone handling** explicit? (Functions accepting local-time results take an IANA timezone argument; no reliance on system timezone.)
- Is **data flow** clear? (Inputs are arrays; functions return plain objects or arrays; no mutation of inputs.)

### Testing & Edge Cases

- Are **critical edge cases tested**? (DST boundaries, partial days, data with all-null stretches, empty inputs, insufficient data.)
- Does `QC_negativeValues` have tests for both modes, including corner cases (values exactly at -10, very small negatives, all negatives)?
- Is the **NowCast algorithm tested against known EPA examples** or reference data?
- Is the **"return empty" behavior** tested when data is insufficient (fewer than 24 hours, fewer than 2 recent values)?
- Are **error cases tested**? (Non-array inputs, mismatched array lengths, non-DateTime entries, non-UTC timestamps, invalid timezone strings.)

### Input Validation & Error Handling

- Does **input validation fail fast?** (`trimDate` is the strict gatekeeper; it throws on type errors. Downstream functions trust its output and don't re-validate.)
- Are **error messages helpful?** (Do they explain what was expected and why?)
- Is there **silent failure risk?** (Data dropped without notice? Results returned when data is insufficient?)
- Are **numeric edge cases handled?** (Infinity, very large/small values, division by zero in NowCast weighting.)

### Module Design & Dependencies

- Is the **dependency graph** as documented? (Validate against `.claude/CLAUDE_ARCHITECTURE.md` call graph.)
- Are **null-handling primitives** (`useNull`, `arrayMin/Max/Count/Sum/Mean`) reused consistently rather than re-implemented?
- Is **trimDate's role as validator** clear and preserved? (It's the only module that imports Luxon and validates types; higher-level functions reuse its output.)
- Could any module be **simpler without losing clarity**?

### API Stability & Backward Compatibility

This is a published package; breaking changes require deliberate version bumps and NEWS.md entries.

- Are **exported function names and signatures** preserved? (List in `src/index.js`.)
- Are **return shapes** stable? (`dailyStats` and `diurnalStats` return objects with `{datetime, count, min, mean, max}`; `diurnalStats` also has `hour`.)
- Are **units, rounding, and null semantics** documented and consistent?
- Would any change break downstream consumers?

### Documentation & Examples

- Do **JSDoc examples** match the usage pattern in README and `.claude/CLAUDE_ARCHITECTURE.md`?
- Are **units documented**? (e.g., concentrations in µg/m³, counts as integers, rounding to 1 decimal.)
- Are **assumptions documented**? (regular hourly axis, no gaps, UTC input, timezone requirements.)
- Are **limits and constraints clear**? (e.g., DST handling, partial days, minimum data requirements.)
- Do **browser examples** work without additional setup? (They use jsdelivr, so they can be loaded directly.)

## Provide

For each issue found, provide:

1. **Location** — file and line number (or section name)
2. **Issue** — what is wrong or could be better
3. **Priority** — high/medium/low
   - **High:** correctness bug, missing test, backward-compatibility risk, security issue
   - **Medium:** clarity, maintainability, edge case not covered
   - **Low:** style, minor optimization, nice-to-have improvement
4. **Suggested fix** — concise recommendation
5. **Why** — brief rationale (references to design decisions or maintainer philosophy are helpful)

## Do Not

- Propose major architectural rewrites unless a clear problem exists.
- Suggest adding dependencies (Luxon is the only runtime dependency by design).
- Recommend optimizations unless performance is a demonstrated problem.
- Assume that the codebase needs refactoring; small, incremental improvements are preferred.

Do not modify any files.
