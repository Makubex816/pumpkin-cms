# V2.8.14 Carryforward

V2.8.14 stopped before deployment because the approved target was not isolated and deployment auth/tooling were not ready.

Carried forward facts:

- Blocked target: `swa-ice-static-staging`.
- Resource group: `rg-ice-static-staging`.
- Default hostname: `happy-mud-0b375e20f.7.azurestaticapps.net`.
- Attached production custom domains: `iceskatingrinkrentals.com`, `www.iceskatingrinkrentals.com`.
- Previous sanitized artifact: `sanitized_20260612222605`.
- Previous aggregate SHA-256: `ad2917480ac7df3b19289153894b35f54fd58b382d69d03afc918e5a037d3201`.
- V2.8.13 backend status remains `backend_verified_for_staging_readiness`.
- No V2.8.14 deployment was executed.

V2.8.14A replaces the future deployment target with an isolated target and refreshes the artifact validation.

