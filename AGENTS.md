# Keyception Repository Instructions

Keyception is a dependency-free static web puzzle built with HTML, CSS, inline SVG, and
vanilla JavaScript.

## Working rules

- Treat `index.html`, `styles.css`, `script.js`, and `favicon.svg` as the public source.
- Do not edit or commit `dist/`; create it with `pnpm build`.
- Keep the project dependency-free unless a real product requirement justifies a package.
- Preserve pointer, touch, pen, and keyboard parity for puzzle interactions.
- Preserve the live status announcements, visible focus states, and reduced-motion path.
- Keep random anomalies separate from deterministic three-stage progression.
- Never commit environment files, credentials, private keys, deployment state, or logs.
- Do not add or modify GitHub Actions without Sudarshan's explicit approval.

## Required verification

Run `pnpm check` for source and documentation changes. Run `pnpm build` before a release
or deployment and deploy only the contents of `dist/`.
