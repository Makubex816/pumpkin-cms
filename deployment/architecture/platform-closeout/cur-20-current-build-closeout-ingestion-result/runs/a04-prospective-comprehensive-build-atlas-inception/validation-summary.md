# Validation summary

Validation passed.

- Canonical package validation: `PACKAGE VALIDATION PASSED: 131 files`
- Canonical package ZIPs committed: `false`
- Release determinism: `passed`
- Atlas ZIP SHA-256 across both runs: `23b33c5d7ca983c985a1a189e2b7b4659104dfe02056fa859efbae171d584eda`
- Working-memory ZIP SHA-256 across both runs: `881fc2a264b84ed3ff90a7e71197a4767b8f603956bccf2f32bcd2542d300f24`
- Fresh Azure readback: passed without appsettings, keys, connection strings, or write commands
- GET probes: API health/readiness, Admin root, isolated Admin retry, and Ice SWA/default custom domains passed
- Upstream recheck: passed as observation; upstream remains unfrozen/not ingested/not qualified

The source ZIP limitation is recorded in the Atlas and manifest: original ZIP files were absent in this workspace, but A01 committed hash/CRC evidence and extracted input trees were available.

