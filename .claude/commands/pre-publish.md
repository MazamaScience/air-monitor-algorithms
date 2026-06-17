---
description: Bump patch version, update NEWS.md, rebuild docs, run tests, tag and commit. Ends with instructions for the developer to push and publish.
allowed-tools: Read, Edit, Bash
---

Prepare this project for a new patch release. Follow each step in order and
stop immediately if any step fails.

## Step 1 — Determine the new version

Read the current version from `package.json`. Compute the next patch version
(e.g. `1.4.0` → `1.4.1`). Show both to the developer before continuing.

## Step 2 — Summarize changes since the last release

Run:

```
git log $(git describe --tags --abbrev=0)..HEAD --oneline
```

Read the output and identify the meaningful changes. Group them into:
- Bug fixes
- New features or behavior changes
- Documentation or tooling changes

Use this as the basis for the NEWS.md entry in Step 4.

## Step 3 — Bump the version in `package.json`

Edit `package.json` to update the `"version"` field to the new patch version.
Do not change anything else in the file.

## Step 4 — Update `NEWS.md`

Add a new entry at the top of `NEWS.md` using this format:

```
# air-monitor-algorithms <new-version>

- <short bulleted description of change 1>
- <short bulleted description of change 2>
...
```

Keep bullets concise (one line each). Use plain language. Do not copy commit
messages verbatim — summarize the intent and effect of each change.

Mark breaking changes explicitly: **Breaking:** ...

## Step 5 — Rebuild documentation

Run:

```
npm run docs
```

If it fails, stop and report the error.

## Step 6 — Run tests

Run:

```
npm test
```

If any tests fail, stop and report the failures. Do not proceed.

## Step 7 — Tag and commit

If Steps 5 and 6 both passed, run:

```
git tag <new-version>
git commit -a -m "Bump to <new-version>: <one-line summary of changes>"
```

The commit message summary should be concise (under 72 characters) and describe
what changed functionally, not just "bump version".

## Step 8 — Handoff to developer

Print the following instructions exactly, substituting the real version number:

---

**Release `<new-version>` is staged. To publish, run these three commands:**

```
git push
git push origin <new-version>
npm publish --access public
```

**Do not run `npm publish` until `git push` has succeeded.**

---

Do not run `git push` or `npm publish` yourself under any circumstances.
