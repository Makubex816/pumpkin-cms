# Admin UI Implementation Plan

## Future Screens

- Backup dashboard.
- Create standard backup.
- Create recovery escrow backup.
- Job status.
- Artifact download.
- Backup validation.
- Restore dry-run.
- Escrow request.
- Audit log.
- Retention cleanup.

## Implementation Sequence

1. Do not implement Admin UI until local exporter and validator pass.
2. Add read-only dashboard mock using API job status contracts.
3. Add standard backup job creation UI.
4. Add validation and restore-plan UI.
5. Add escrow request UI only after escrow prototype and access controls exist.
6. Add retention cleanup UI last.

## Warning Text

UI must display:

- "Standard backups do not include passwords, API keys, tokens, cookies, or connection strings."
- "Recovery escrow is encrypted, elevated, and separately approved."
- "Creating escrow does not restore secrets."
- "Restore starts in sandbox/local validation, not production."

## Hard Stops

UI must block escrow in standard backups, production restore without approval, download after expiration, and any workflow that would publish live pages or touch external systems.
