# Roller Exclusion Check

Result: passed.

Roller stayed excluded and blocked:

- Tenant key: `roller-rink-rentals`.
- Package ID: `roller-rink-rentals-paused-preview-v2-11-2`.
- Expected hash: `sha256:e5567ddc0f9b3c4e655f958d9f25cd3bef8ec72ce2f553fa37d36bab38a05b29`.
- Actual hash: `sha256:e5567ddc0f9b3c4e655f958d9f25cd3bef8ec72ce2f553fa37d36bab38a05b29`.
- Target mode: `blocked_no_import_no_resume`.
- No-go conditions: `tenant_paused_no_import`.
- Dry-run allowed: `false`.
- Import approved: `false`.
- Resume approved: `false`.

No Roller import, no Roller resume, and no Roller write/readback command was run.

