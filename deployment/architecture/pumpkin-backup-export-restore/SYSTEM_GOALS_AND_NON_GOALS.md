# System Goals And Non-Goals

## Goals

- Provide tenant-scoped and full-platform backup modes.
- Provide content, media, database, static evidence, and config inventory export strategies.
- Treat encrypted secret escrow as a first-class recovery flow.
- Keep normal backups safe for operators and support packets by excluding secrets.
- Validate every backup bundle with manifest checks, checksums, schema checks, and restore-readiness results.
- Support offline editing packages without exposing runtime credentials.
- Provide UI, CLI, and operator workflows with clear low-skill warnings.
- Run large backup/restore tasks through background jobs instead of browser-synchronous zip generation.
- Record complete audit logs without secret values.
- Enforce retention, expiration, deletion, and access controls.

## Non-Goals

- No implementation in Phase 2F-1.
- No backup or zip creation.
- No database export.
- No secret export.
- No escrow payload creation.
- No secret reading or protected config reading.
- No restore execution.
- No CMS write or MediaAsset write.
- No Azure, Cloudflare, DNS, deployment, Function App setting, email, Microsoft 365, Search Console, indexing, or live-page action.

## Design Principle

Backup Center should make safe paths easy and unsafe paths impossible by default. The normal backup button must not have a hidden way to include secrets. Escrow requires an explicit recovery-mode path, elevated permissions, approval, encryption, and audit records.
