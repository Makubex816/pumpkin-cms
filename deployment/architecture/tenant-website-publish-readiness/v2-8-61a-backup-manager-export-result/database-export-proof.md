# Database Export Proof

Status: passed.

Database export was completed through existing authenticated Pumpkin API read routes.

| Domain | File | Count |
| --- | --- | ---: |
| Tenant | `database/tenant.json` | 1 |
| Pages | `database/pages.json` | 5 |
| MediaAssets | `database/media-assets.json` | 13 |
| Themes | `database/themes.json` | 1 |
| FormDefinitions | `database/form-definitions.json` | 1 |
| FormEntries | `database/form-entries.json` | 0 |
| ImportRuns | `database/import-runs.json` | 0 |
| PublishRuns | `database/publish-runs.json` | 0 |
| DomainBindings | `database/domain-bindings.json` | 1 |
| Users, sanitized | `database/users-sanitized.json` | 1 |
| BackupRuns | `database/backup-runs.json` | 0 |

Page slugs exported:

- `home`
- `contact`
- `packages`
- `request-booking`
- `service-areas`

The active FormDefinition `airstrip-reservation` was exported.
