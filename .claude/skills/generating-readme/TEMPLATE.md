# <project-name>

A brief **one-to-two sentence description** explaining the core purpose of this project. Define exactly what problem it solves and who uses it.

---

## System Overview

* **Component Type:** [e.g., server-rendered web app / microservice / worker / CLI tool / library]
* **Runtime/Port(s):** [runtime and version; port(s), if this component listens on one]
* **Upstream Dependencies:** [systems or repos this component reads from or calls]
* **Downstream Consumers:** [systems or repos that depend on this component]
* **Architecture Docs:** [link to this repo's own architecture doc, if one exists]

---

## Tech Stack

| Layer | Technology | Version | Purpose |
| :--- | :--- | :--- | :--- |
| **Runtime** | [language/runtime] | [version] | Core execution environment |
| **Framework** | [framework, if any] | [version] | Application structure |
| **Database** | [database(s), if any] | [version] | Primary state / caching |
| **CI/CD** | [CI provider, if any] | — | Automation pipeline |

---

## Getting Started

### 1. Prerequisites
* [Runtime + version]
* [Any other real system dependency]

### 2. Local Setup

```bash
git clone <repo-url>
cd <repo-directory>
<this repo's real install command>
```

### 3. Environment Configuration
[How this repo actually manages local config and secrets.]

> [!IMPORTANT]
> Never commit real secrets to version control.

### 4. Running Locally

```bash
<this repo's real command to start the app locally>
```

The application will be accessible at [real URL/port, if applicable].

---

## Development

### Ending a Work Session

This project uses the `claude-overlay` slash commands to keep documentation
and release hygiene consistent across sessions. Before wrapping up a work
session, run:

1. `/documentation-review` — catch documentation drift before it accumulates
2. `/wrap-up` — end-of-session checklist (tests, build, git status)
3. `/pre-publish` — only when preparing a release (version bump, changelog, tag)

---

## Testing & Quality

* **Tests:** `<real test command>`
* **Linting & Formatting:** `<real lint/format command, if configured>`

---

## Deployment & DevOps

### Infrastructure Strategy
[How and where this component actually runs in production.]

### Build

```bash
<real command(s) to build a deployable artifact/image, if applicable>
```

### Release Process
[How a change actually reaches each environment.]

---

## Additional Resources

* [Resource name] — [link]
