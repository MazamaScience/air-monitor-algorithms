---
name: generating-readme
description: Use when creating or updating the top-level README.md for this project, to align it with the project's standardized README template.
---

# Generating a README

## Overview

This project uses a standardized README structure (`TEMPLATE.md`, next to this
file). The template is intentionally generic — every bracketed placeholder
(`[framework, if any]`, `<real test command>`, etc.) exists to be replaced
with what this specific repo actually has, or removed if this repo doesn't
have that thing at all.

**Core rule:** every fact in the finished README must be traceable to
something you actually read in this repo (a file, a script, a config value).
A bracketed placeholder left unfilled, or filled with a guess, is worse than
omitting the row or section entirely.

**The output is a README, not a diff against the template.** A newcomer
skimming it should never see any trace of the generation process — no
placeholder brackets, and no sentences that talk about the template itself
(e.g. "this row is omitted", "left blank per the template"). If something
doesn't apply, just leave it out silently, the way a human writing this
README from scratch would.

If this project has sibling repos that share this same template, keep the
section structure consistent across them — a contributor moving between repos
should find the same headings in the same order — but every field's content
must still come from that specific repo, never copied from a sibling.

**Exception to the core rule:** the "Development → Ending a Work Session"
section is fixed content, not a fact about this specific repo. Reproduce it
as written in `TEMPLATE.md` — don't verify it against the repo, don't drop it
for "not applying here," and don't reword it into project-specific language.
It documents the `claude-overlay` slash-command workflow, which is the same
for every project this skill is installed into.

## Known exceptions

- **air-monitor-algorithms** — this repo's `README.md` intentionally keeps its
  existing library-specific structure (Features / Examples / Installation /
  Usage / Related Packages / For Developers) rather than the service-oriented
  template above. This was a deliberate decision, not an oversight — do not
  restructure it to match `TEMPLATE.md`, and do not re-flag the mismatch in
  future documentation reviews.

## Inspection checklist

Before filling in a section, check the real source — don't infer from what's
common elsewhere:

| Template field | Check |
|---|---|
| Component type / runtime / ports | Entry point file, `Dockerfile`, `docker-compose*.yml`, any port config |
| License/CI badge | Is there a real `LICENSE` file and a real CI provider config (e.g. `.github/workflows/`)? If not, leave the badge line out — don't add a badge for a status that doesn't exist. |
| Tech Stack table | The manifest file for this language (`package.json`, `pyproject.toml`, `DESCRIPTION`, etc.), lockfile, and any Dockerfile/compose files |
| Install / run commands | The real scripts or commands defined in this repo — don't assume a particular package manager or a `dev`/`start` script exists |
| Environment Configuration | This repo's actual convention for local config — a committed example file, a config module with startup validation, or something else entirely; describe what's real |
| Development → Ending a Work Session | No inspection needed — copy verbatim from `TEMPLATE.md` (see "Exception to the core rule" above) |
| Testing & Quality | Real test/lint/format commands actually defined here — omit any that aren't configured |
| Deployment & DevOps | This repo's actual release mechanism. If deploys are manual (scripts, `make` targets, SSH), say so plainly — don't describe CI/CD automation that doesn't exist |
| Additional Resources | Only link docs, runbooks, or channels that actually exist for this repo — for AI-assisted repos this is often just the in-repo `CLAUDE.md`/architecture docs |

## Formatting for skimmability

- **No emoji.** Not in section headers, not anywhere in the output — plain
  text headings only.
- **Long lists of related items (env vars, dependencies, etc.) get grouped
  bullets, not one run-on sentence.** Group by purpose/category with a bold
  label, e.g. `**Auth:** AUTH_URL, AUTH_KEY, AUTH_SECRET`. A sentence packing
  in 15+ inline code spans is unreadable.
- **When there's a real command per environment/variant, show each on its
  own line** — don't compress them into one example line with an inline
  `# or: x / y / z` comment. Three short lines skim faster than one line plus
  a comment a reader has to parse.
- Prefer a short lead sentence before a code block over a comment line inside
  the block explaining what directory to run it from.

## Common mistakes

- **Narrating the template-filling process in the output.** Never write
  something like "this row is omitted rather than filled with a
  placeholder" — that's an instruction to you, not a fact about the repo.
  State the real fact plainly (or omit it) and stop there.
- **Filling a row/section just to keep the template's shape.** If this repo
  has no CI, no database, or no lint script, omit that row or section
  entirely — don't write "None" or fake a badge for it.
- **Leaving a bracketed placeholder in the output.** `[version]` or
  `<real test command>` in the finished README means you didn't verify that
  field — go check, or drop the line.
- **Assuming a specific stack.** The template doesn't name a package manager,
  framework, or CI provider on purpose — different repos use different ones
  (or none). Read this repo's own manifest/lockfile/config instead of
  defaulting to whatever is most common.
- **Guessing at a link.** A channel name or wiki URL you can't find in the
  repo should be `TODO: confirm with team`, not an invented URL.
