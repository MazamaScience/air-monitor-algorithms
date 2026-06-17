---
description: Review JSDoc, README, NEWS, and Claude .md files for completeness, consistency, and alignment. Catches drift between source comments and user-facing docs.
allowed-tools: Read, Bash
---

Please review all documentation in this project for completeness and alignment.

## Scope

Review three documentation layers:

1. **JSDoc** — comments in `src/*.js` and their `@param`, `@returns`, `@example` blocks
2. **Markdown** — `README.md`, `NEWS.md`, `CLAUDE.md`, `.claude/CLAUDE_ARCHITECTURE.md`
3. **Cross-project docs** — `.claude/CLAUDE_STYLE_GUIDE.md`

## Checks for alignment

- **Function signatures:** Do exported function names, parameters, and return shapes
  in README/CLAUDE match the JSDoc `@param` and `@returns` descriptions?
- **Breaking changes:** Are breaking changes listed in `NEWS.md` (v1.4.0+) also
  reflected in updated JSDoc and/or README.md examples?
- **Renamed symbols:** When a function is renamed (e.g. `qcType` → `QC_negativeValues`
  in v1.4.0), verify the old name does not appear in `.md` documentation, though
  it may appear in `NEWS.md` as historical changelog.
- **Units and conventions:** Do units, timezone requirements, and null-handling
  conventions described in README/CLAUDE match the descriptions in JSDoc?
- **Examples:** Do `@example` blocks in JSDoc match the usage pattern shown in
  README's "Usage" section? Do they use the same Luxon conventions?
- **Missing setup/prerequisites:** Does README clearly state the requirement for
  Luxon `DateTime` in UTC? Is this also documented in CLAUDE.md constraints?

## Identify

- Missing or incomplete JSDoc (missing `@param`, `@returns`, `@example`, units)
- Stale JSDoc (references renamed functions, outdated behavior)
- Inconsistent conventions between `.md` files and JSDoc
- Missing examples or unclear usage instructions
- Confusing or contradictory sections
- Outdated information (especially after version bumps)
- Links or cross-references that are broken or dangling

## Provide

Suggested improvements, with:
- File and line number (or section name)
- What the drift is
- How to fix it
- Priority (high/medium/low)

Do not modify any files.
