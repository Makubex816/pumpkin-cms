# Full Tenant Database Backup Result

Status: passed.

The tenant-scoped exporter wrote 20 object exports plus `database-content-digests.json` under the restricted outside-repository backup. All completed-backup JSON documents parsed successfully.

| Export | Count |
| --- | ---: |
| `tenant.json` | 1 |
| `users-sanitized.json` | 1 |
| `themes.json` | 1 |
| `pages.json` | 43 |
| `page-identities.json` | 43 |
| `page-revisions.json` | 0 |
| `page-owned-redirects.json` | 1 |
| `tenant-redirects.json` | 2 |
| `catalog-records.json` | 10 |
| `guide-article-records.json` | 19 |
| `media-assets.json` | 302 |
| `source-path-aliases.json` | 473 |
| `form-definitions.json` | 32 |
| `form-instance-mappings.json` | 65 |
| `form-entries.json` | 0 |
| `domain-bindings.json` | 1 |
| `import-runs.json` | 1 |
| `publish-runs.json` | 1 |
| `compliance-launch-holds.json` | 1 |
| `runtime-key-status.json` | 1 |

Users were exported as sanitized metadata. Authentication values, credential values, runtime-key plaintext, JWTs, cookies, API keys, connection strings, and storage credentials were excluded. The backup secret scan passed.
