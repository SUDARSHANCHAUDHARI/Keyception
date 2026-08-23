# Keyception

![Version](https://img.shields.io/badge/version-1.0.0-315965)
![Status](https://img.shields.io/badge/status-production--ready-88c7b5)
![JavaScript](https://img.shields.io/badge/JavaScript-vanilla-e7bd5a?logo=javascript&logoColor=07171f)
![Dependencies](https://img.shields.io/badge/runtime_dependencies-0-f36b3d)
![License](https://img.shields.io/badge/license-MIT-dce4df)

Keyception is a short, standalone browser puzzle where every key unlocks another
unnecessary lock. It combines semantic HTML, responsive CSS, inline SVG, and vanilla
JavaScript without frameworks, downloaded media, analytics, or runtime dependencies.

> Three keys. Three locks. One door. Then another locked door.

## Table of contents

- [Overview](#overview)
- [Features](#features)
- [How to play](#how-to-play)
- [Puzzle flow](#puzzle-flow)
- [Random anomaly system](#random-anomaly-system)
- [Technology](#technology)
- [Architecture](#architecture)
- [Accessibility](#accessibility)
- [Project structure](#project-structure)
- [Getting started](#getting-started)
- [Available commands](#available-commands)
- [Production build and release](#production-build-and-release)
- [Security and privacy](#security-and-privacy)
- [Browser support](#browser-support)
- [Contributing](#contributing)
- [About](#about)
- [License](#license)

## Overview

The player receives a plausible brass key and a simple instruction: drag it into the
lock. Each successful test triggers an unnecessary complication. The puzzle progresses
through three increasingly strange keys and locks before the outer door finally opens
to reveal the message:

> “You have unlocked another problem.”

The visual direction is a cold municipal locksmith archive: blueprint navy, chalk
white, oxidized brass, signal orange, stamped utility labels, and a cutaway door
assembly that physically misbehaves during each test.

## Features

- Three authored puzzle stages with increasingly strange keys and locks.
- Drag interaction for mouse, touch, and pen through Pointer Events.
- Full keyboard path using arrow keys, `Enter`, `Space`, and `Escape`.
- Forgiving collision detection based on the rendered key and lock geometry.
- Eight shuffled anomaly events, all guaranteed to appear once per completed run.
- Authored drawer-opening, secondary-key, and smaller-door transitions.
- Generated Web Audio effects with no downloaded audio files.
- Sound toggle, reset controls, attempt indicators, and three-stage progress tracking.
- Responsive layouts for desktop, tablet, and phone viewports.
- Live status announcements, descriptive controls, and visible keyboard focus.
- Reduced-motion and forced-color support.
- Restrictive browser Content Security Policy.
- Dependency-free validation and deterministic production builds.

## How to play

### Mouse, touch, or pen

1. Pick up the visible key.
2. Drag it into the lock marked for the current stage.
3. Release the key and observe the resulting administrative irregularity.
4. Repeat the deliberately redundant test to advance.

### Keyboard

1. Press `Tab` until the key receives focus.
2. Move it with the arrow keys. Hold `Shift` for larger movements.
3. Press `Enter` or `Space` to route it automatically into the current lock.
4. Press `Escape` to return the key to its tray.

The sound control and reset button are keyboard-accessible native buttons. Sound starts
only after user interaction to respect browser autoplay policies.

## Puzzle flow

### I. The plausible key

The player starts with an ordinary brass key and large-door lock `L–01`. After two
tests, the key ignores the door and opens the spare-key drawer instead. The drawer
contains the second key.

### II. The questionable key

The second key is jointed and visibly less credible. It is tested against drawer lock
`L–02`. Once both tests are filed, a smaller door emerges beneath the original one.

### III. The administrative key

The third key has an impossible zig-zag profile and a keyhole of its own. It is tested
against smaller-door lock `L–03`. Completing the second test opens the large door and
reveals another locked door.

## Random anomaly system

Every reset shuffles all eight incidental anomalies. The six required key drops consume
the queue in a `1, 1, 2, 1, 1, 2` pattern. Every anomaly therefore appears exactly once
per completed run, while its stage and timing change:

1. The lock moves.
2. The key bends.
3. The door changes position.
4. The lock rejects the key, then records it as conditional approval.
5. The key duplicates.
6. The door rotates.
7. The key unlocks itself.
8. A tiny character steals and returns the key.

Randomness decorates the experience but never controls progression. The drawer opening
and smaller-door appearance are deterministic stage transitions, ensuring that an
unlucky event order cannot trap the player.

## Technology

| Area | Implementation |
| --- | --- |
| Structure | Semantic HTML5 |
| Styling | Responsive CSS, custom properties, media queries, keyframe choreography |
| Graphics | Inline SVG and CSS-drawn secondary objects |
| Interaction | Vanilla JavaScript and Pointer Events |
| Audio | Browser Web Audio API oscillators |
| State | Small in-memory finite-stage state machine |
| Validation | Node.js syntax and structural checks |
| Build | Dependency-free Node.js artifact builder |
| Package manager | pnpm 10.28.2 |
| Runtime dependencies | None |

## Architecture

The public application is intentionally small and direct:

- `index.html` contains the semantic interface and SVG puzzle scene.
- `styles.css` owns the visual system, responsive composition, stage variants, and
  anomaly animations.
- `script.js` owns the stage state, shuffled event queue, input handling, collision
  detection, audio synthesis, progress, accessibility announcements, and reset logic.
- `scripts/verify.mjs` checks the required files, unique IDs, interaction hooks,
  anomaly coverage, accessibility markers, CSP, and responsive-motion rules.
- `scripts/build.mjs` copies only the four public assets into a clean `dist/` directory
  and verifies every referenced asset exists.

The state machine keeps authored progress separate from random incidents. A run token
invalidates pending asynchronous animations after reset, preventing an old event from
mutating the newly restarted puzzle.

## Accessibility

Keyception includes:

- A skip link and semantic headings.
- A native button as the draggable key.
- Pointer, touch, pen, and keyboard parity.
- Descriptive accessible names for the current key and lock.
- A polite `aria-live` status region for puzzle feedback.
- Semantic stage progress and attempt indicators.
- Clearly visible `:focus-visible` states.
- Controls sized for touch on narrow screens.
- An inert final reveal until completion, preventing premature keyboard focus.
- `prefers-reduced-motion: reduce` behavior that preserves every state change while
  compressing animation.
- Forced-color fallbacks for high-contrast environments.

## Project structure

```text
Keyception/
├── .editorconfig       # Consistent text-file formatting
├── .gitignore          # Secrets, caches, and generated-output exclusions
├── AGENTS.md           # Repository-specific development rules
├── CHANGELOG.md        # User-facing release history
├── LICENSE             # MIT license
├── README.md           # Project documentation
├── SECURITY.md         # Vulnerability reporting and security posture
├── favicon.svg         # Standalone key mark
├── index.html          # Semantic shell and inline SVG scene
├── package.json        # Project metadata and commands
├── pnpm-lock.yaml      # Reproducible package-manager metadata
├── script.js           # Puzzle state and interaction logic
├── styles.css          # Visual system and event choreography
└── scripts/
    ├── build.mjs       # Deterministic production artifact builder
    └── verify.mjs      # Dependency-free structural checks
```

`dist/` is generated by the production build and intentionally excluded from Git.

## Getting started

### Prerequisites

- Node.js 20 or newer.
- pnpm 10.28.2, pinned in `package.json`.
- Python 3 for the included local static-server commands.
- A current Chrome, Edge, Firefox, or Safari browser.

### Installation

The GitHub repository is private during pre-launch, so cloning requires an authorized
GitHub account:

```bash
git clone https://github.com/SUDARSHANCHAUDHARI/Keyception.git
cd Keyception
pnpm install --frozen-lockfile
```

Start the source version locally:

```bash
pnpm start
```

Then open `http://localhost:4173`. Because the application has no third-party packages,
`index.html` can also be opened directly in a modern browser.

## Available commands

| Command | Purpose |
| --- | --- |
| `pnpm dev` | Serve source files locally on port 4173 |
| `pnpm start` | Alias for the local development server |
| `pnpm check` | Validate JavaScript syntax and project structure |
| `pnpm build` | Run checks and create the production `dist/` artifact |
| `pnpm preview` | Serve the generated production artifact on port 4173 |

## Production build and release

Create a clean, host-ready artifact:

```bash
pnpm build
```

The build first runs all checks, then writes exactly these files to `dist/`:

```text
dist/
├── favicon.svg
├── index.html
├── script.js
└── styles.css
```

Preview the exact production artifact with `pnpm preview`. Deploy the contents of
`dist/` to any HTTPS-capable static host.

Before public release:

1. Complete all three stages with pointer input.
2. Complete all three stages with keyboard input.
3. Confirm sound toggling and reset behavior.
4. Test a narrow mobile viewport.
5. Test with reduced motion and forced colors enabled.
6. Configure response headers for `Content-Security-Policy`,
   `X-Content-Type-Options: nosniff`, `Referrer-Policy: no-referrer`, and an appropriate
   `Permissions-Policy`.
7. Deploy only `dist/`, then run a final interaction smoke test on the production URL.

The HTML document includes a CSP fallback for file-based hosting. Production hosting
should send the policy as an HTTP response header.

## Security and privacy

Keyception is entirely client-side. It has no authentication, database, analytics,
advertising, cookies, uploaded content, third-party scripts, or network requests. It
does not collect, transmit, or store personal data. Sounds are generated locally in the
browser.

Report vulnerabilities privately according to [SECURITY.md](SECURITY.md). Do not open a
public issue for an unpatched vulnerability.

## Browser support

Keyception targets current stable versions of Chrome, Edge, Firefox, and Safari. It
relies on Pointer Events, CSS custom properties, inline SVG, the Web Audio API, and the
`inert` attribute.

## Contributing

1. Create a focused branch from `main`.
2. Preserve pointer, touch, pen, and keyboard interaction parity.
3. Preserve reduced-motion and live-announcement behavior.
4. Run `pnpm check` for documentation or source changes.
5. Run `pnpm build` before requesting a release or deployment.
6. Keep generated `dist/`, credentials, environment files, deployment state, and logs
   out of commits.

See [AGENTS.md](AGENTS.md) for repository-specific engineering rules and
[CHANGELOG.md](CHANGELOG.md) for user-facing changes.

## License

Copyright © 2026 SudarshanTechLabs.

Keyception is released under the [MIT License](LICENSE). You may use, copy, modify,
merge, publish, distribute, sublicense, and sell copies subject to the license terms.

---

## About

I'm Sudarshan Chaudhari, a Senior Quality Engineer, Test Automation specialist, and AI systems builder based in Bangkok, Thailand.

I have 13+ years of experience in software quality engineering, working across SaaS, fintech, gaming, web, mobile, cloud, and digital signage platforms. My background combines hands-on test automation with QA leadership, test strategy, CI/CD, release quality, production investigation, and cross-platform validation.

Alongside my professional QA career, I run [SudarshanTechLabs](https://sudarshantechlabs.com/), my independent engineering and product lab where I design, build, test, and ship software across Android, web, AI, cybersecurity, developer tooling, and cross-platform applications.

### What I work on

- ⚙️ **Quality Engineering & Test Automation** — Playwright, Selenium, Cypress, Appium, API testing, automation frameworks, end-to-end testing, CI/CD, release gates, GitHub Actions, risk-based testing, and production validation
- 🤖 **AI Systems & Automation** — AI agents, multi-agent orchestration, MCP servers, AI-assisted QA, prompt tooling, developer workflows, automation systems, and Claude Code plugins
- 📱 **Mobile & Cross-Platform Applications** — Android applications built with Kotlin and Jetpack Compose, Google Play releases, automated build and publishing pipelines, and cross-platform development spanning iOS, web, Windows, and macOS
- 🌐 **Web Applications & Platforms** — Full-stack applications using Next.js, TypeScript, Firebase, Cloudflare, REST APIs, and modern web infrastructure
- 🛠️ **Developer Tooling & CLI Engineering** — Rust, Python, TypeScript, CLI utilities, multi-repository tooling, build automation, release tooling, and engineering productivity systems
- 🛡️ **Cybersecurity & Observability** — Threat detection, log analysis, security auditing, vulnerability assessment, monitoring, and security-focused developer tools
- 📺 **Digital Signage & Device Platforms** — Content validation, playback testing, device compatibility, production investigation, monitoring, and QA across diverse hardware and operating-system environments

My work sits at the intersection of quality engineering, automation, AI, and software development. I approach products with a QA mindset from the beginning: understanding failure modes, designing for testability, automating repetitive work, and building release confidence into the engineering process.

Through SudarshanTechLabs, I also build products and tools from idea to production, covering architecture, development, testing, CI/CD, release automation, monitoring, and ongoing maintenance.

🌐 [sudarshantechlabs.com](https://sudarshantechlabs.com/) · 💼 [LinkedIn](https://linkedin.com/in/sudarshan-chaudhari) · 🐙 [GitHub](https://github.com/SUDARSHANCHAUDHARI) · ✉️ [sunny.sudarshan@gmail.com](mailto:sunny.sudarshan@gmail.com)
