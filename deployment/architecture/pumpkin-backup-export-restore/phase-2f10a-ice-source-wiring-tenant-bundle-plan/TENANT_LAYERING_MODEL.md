# Tenant Layering Model

## Layers

| Layer | Purpose | Example |
| --- | --- | --- |
| Tenant | business/customer boundary | `ice-rink-rentals` |
| Site | website/domain boundary | `ice-rink-rentals` |
| CMS source | editable content source | pages, forms, SEO, theme |
| Media metadata | CMS registry source | MediaAsset records |
| Media blobs | binary source | Azure Blob paths |
| Public output | deployable static visitor surface | `public/` |
| Config inventory | runtime requirements | redacted env names/status |
| Backup artifacts | recovery source | DB export, media copy, manifest, checksums |
| Restore evidence | recovery proof | dry-run/readback reports |
| Operator handoff | approval and operational source | DNS, forms, rollback, support |

## Separation Requirements

- CMS source and public output must not be treated as the same thing.
- Media metadata and media binaries must not be treated as the same thing.
- Config inventory and secret escrow must not be treated as the same thing.
- Backup creation and restore execution must not be treated as the same thing.
- Local-dev sources and live-Azure sources must be profile-selected, not implicit.

## Restore Dependency Flow

1. Tenant/site manifest.
2. CMS source export.
3. Database artifact/provider evidence.
4. Media metadata and blob proof.
5. Static/public output evidence.
6. Redacted config inventory.
7. Checksums.
8. Validator.
9. Restore-plan dry-run.
10. Owner go/no-go.

