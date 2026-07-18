# Security Policy

## Supported version

Security fixes are applied to the current `main` branch until tagged releases begin.

## Reporting a vulnerability

Please report suspected vulnerabilities privately to `sudarshantechlabs@gmail.com`.
Include the affected browser, reproduction steps, impact, and any suggested mitigation.
Do not open a public issue for an unpatched vulnerability.

## Current security posture

Keyception is a client-only static application. It has no authentication, database,
analytics, third-party scripts, network requests, uploaded content, or runtime package
dependencies. Sounds are synthesized locally with the Web Audio API.

The document includes a restrictive Content Security Policy fallback. Production hosts
should also send security response headers over HTTPS as described in `README.md`.
