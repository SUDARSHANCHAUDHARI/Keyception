# Keyception

Keyception is a short, standalone browser puzzle where every key unlocks another
unnecessary lock. It uses semantic HTML, CSS, inline SVG, and vanilla JavaScript—no
frameworks, packages, image assets, or audio files are required.

## Run it

Open `index.html` directly in a modern browser, or serve the folder locally:

```bash
pnpm start
```

Then visit `http://localhost:4173`.

Run the dependency-free project checks with:

```bash
pnpm check
```

Node.js 20 or newer and pnpm 10.28.2 are the supported development toolchain.

## How to play

- Drag the visible key into the marked lock with a mouse, touch screen, or pen.
- With a keyboard, focus the key, use the arrow keys to reposition it, and press
  `Enter` or `Space` to route it into the current lock. `Escape` returns it to its tray.
- Each lock requires two deliberately redundant tests.
- Sound is optional and can be toggled from the header.
- Reset restarts the full sequence and reshuffles the anomaly order.

## Puzzle flow

### I. The plausible key

The player starts with an ordinary brass key and the large door's lock (`L–01`). After
two tests, the key ignores the door and opens the spare-key drawer instead. The drawer
contains the second key.

### II. The questionable key

The second key is jointed and visibly less credible. It is tested against drawer lock
`L–02`. Once its two tests are filed, a smaller door emerges beneath the original one.

### III. The administrative key

The third key has an impossible zig-zag profile and a keyhole of its own. It is tested
against the smaller door's lock (`L–03`). Completing the second test opens the large
door and reveals another locked door with the message:

> “You have unlocked another problem.”

## Random anomaly system

Every run shuffles all eight incidental anomalies. The six required key drops consume
that queue in a `1, 1, 2, 1, 1, 2` pattern, so every anomaly appears once per completed
run while its timing changes:

1. The lock moves.
2. The key bends.
3. The door changes position.
4. The lock rejects the key (recorded as “conditional approval,” so progress continues).
5. The key duplicates.
6. The door rotates.
7. The key unlocks itself.
8. A tiny character steals and returns the key.

The drawer opening and smaller-door appearance are authored stage transitions rather
than random events, ensuring the three-key story remains clear.

## Implementation notes

- **Input:** Pointer Events provide one drag path for mouse, touch, and pen. Collision
  detection compares the rendered key and lock rectangles, including a small forgiving
  target margin.
- **Progression:** A small state machine owns the current stage, attempt count, shuffled
  anomaly queue, busy state, and completion state.
- **Audio:** Web Audio API oscillators synthesize pickup, impact, anomaly, success, and
  finale sounds after user interaction. No audio is downloaded.
- **Accessibility:** The draggable key is a native button with keyboard controls, visible
  focus, instructions, descriptive labels, a polite live status region, semantic
  progress, and 44px-or-larger utility controls on small screens.
- **Motion:** `prefers-reduced-motion: reduce` compresses transitions and animation while
  preserving every state change and message.
- **Responsive design:** The progress rail becomes horizontal on narrower screens, and
  the door, drawer, key, lock targets, and final reveal recompose for phone layouts.

## Project files

```text
Keyception/
├── .editorconfig       # Consistent text-file formatting
├── .gitignore          # Secrets, caches, and generated output exclusions
├── AGENTS.md           # Repository-specific development rules
├── CHANGELOG.md        # User-facing release history
├── SECURITY.md         # Vulnerability reporting and security posture
├── index.html          # Semantic shell and inline SVG scene
├── styles.css          # Visual system, responsive layout, and event choreography
├── script.js           # State, drag/collision, audio, anomalies, and accessibility
├── favicon.svg         # Standalone key mark
├── package.json        # Local server and validation commands
├── pnpm-lock.yaml      # Reproducible toolchain metadata
├── scripts/build.mjs   # Deterministic production artifact builder
├── scripts/verify.mjs  # Dependency-free structural checks
├── LICENSE             # MIT license
└── README.md           # Setup and puzzle-flow documentation
```

## Production build and release

Create a clean, host-ready artifact with:

```bash
pnpm build
```

The command runs all checks first, then copies only the four required public assets to
`dist/`. Preview that exact artifact with:

```bash
pnpm preview
```

Deploy the contents of `dist/` to any static host. Before publishing a release, manually
complete all three puzzles with pointer input and keyboard input, confirm sound toggling,
test a narrow mobile viewport, and test with reduced motion enabled. Configure the host
to serve HTTPS and add response headers for `Content-Security-Policy`,
`X-Content-Type-Options: nosniff`, `Referrer-Policy: no-referrer`, and an appropriate
`Permissions-Policy`; the HTML already provides a CSP fallback for file-based hosting.

## Browser support

Keyception targets current versions of Chrome, Edge, Firefox, and Safari. It relies on
Pointer Events, CSS custom properties, inline SVG, and the Web Audio API.
