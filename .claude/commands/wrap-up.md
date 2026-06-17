---
description: End-of-session checklist — run tests, build, docs, and summarize git status. Run before pushing to GitHub or publishing to npm.
allowed-tools: Read, Bash
---

Please run the end-of-session checklist for this project:

1. Run `npm test` and confirm all tests pass. If any fail, report them and stop.
2. Run `npm run build` to verify the dist bundles build cleanly.
3. Run `npm run docs` to regenerate the JSDoc documentation.
4. Run `git status` and summarize any uncommitted changes.
5. If there are staged or unstaged changes, show a `git diff` summary and ask whether I want to commit them.
6. Report the current version from `package.json` and the most recent entry in `NEWS.md`.

Do not commit, push, or modify any files unless I explicitly ask.
