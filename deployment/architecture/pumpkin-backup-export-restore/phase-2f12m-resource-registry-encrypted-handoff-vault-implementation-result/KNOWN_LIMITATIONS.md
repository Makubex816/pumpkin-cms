# Known Limitations

- The resource registry is still fixture-seeded; live read-only inventory reconciliation is a next phase.
- The vault allowlist currently includes only `ROLLER_RINK_RENTALS_API_KEY`.
- The package creates folder-based handoff packages, not zip archives.
- Session vault validation requires the passphrase in the process environment.
- No Admin UI, Pumpkin API, Electron workflow, deployment workflow, or live publishing workflow was implemented.
