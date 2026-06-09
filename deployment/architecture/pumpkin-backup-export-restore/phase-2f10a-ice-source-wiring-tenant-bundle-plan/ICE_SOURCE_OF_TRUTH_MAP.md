# Ice Source Of Truth Map

## Source Layers

| Layer | Current Source Of Truth | Status | Backup Role | Notes |
| --- | --- | --- | --- | --- |
| Tenant identity | Pumpkin CMS/API tenant records for `ice-rink-rentals` | Wired through CMS read-only export | `cms-content/tenants.json` | Phase 2F-10 validated 1 tenant |
| Site identity | CMS site/profile evidence for Ice | Wired through CMS read-only export | `cms-content/sites.json` | Phase 2F-10 validated 1 site |
| CMS pages/routes/forms/SEO/theme | Pumpkin API/admin read-only export | Wired for standard content backup | `cms-content/` | GET-only evidence succeeded in prior phases |
| Database provider | API `DatabaseService` provider config; docs identify Cosmos DB/MongoDB support | Partially wired | DB connector must discover provider first | Azure SQL discovery returned no SQL servers |
| Live production database | Ice production architecture docs identify `azure-cosmos-db` | Owner decision required for live DB source proof | Future DB provider connector | Cosmos resource was not queried in this phase because allowed Azure discovery was limited |
| Media metadata | CMS MediaAsset records | Wired for metadata inventory | `media/media-assets.json` | Phase 2F-10 validated 12 MediaAsset records |
| Media blobs | Azure Blob storage account `iceskatingmedia`, container `ice-rink-rentals-media` | Partially wired by read-only discovery | Future blob connector | Container metadata discovered; no blobs listed or downloaded |
| Static output | Azure Static Web Apps live site plus local static artifacts/dry-runs | Partially wired | `static/static-output-manifest.json` and future tenant bundle `public/` | Live site is documented as cut over to Azure SWA |
| Contact form endpoint | Azure Function `func-ice-static-contact-20260605` | Wired for no-email/dry-run endpoint evidence | `forms/endpoint/` future bundle evidence | Real email remains separate approval |
| Domains/DNS | Cloudflare DNS records for apex, `www`, media, Microsoft 365/autodiscover | Wired in safe docs; no live DNS action here | `operator-handoff/dns/` evidence | Search Console/indexing remains hard-stopped |
| Config inventory | Process/env/app setting names, presence-only | Partially wired | `config-inventory/` | Values never belong in standard backup |
| Backup artifacts | Backup Center `.tmp` local output today | Wired locally; long-term storage open | `backups/` metadata and ignored artifact roots | Generated artifacts must not be staged |
| Restore validation | Backup Center restore-plan dry-run | Wired for local dry-run | `restore/` reports | No live restore approved |

## Layer Classification

- Fully wired today: CMS read-only content, static evidence, redacted config inventory, media metadata, validator/restore dry-run.
- Partially wired today: live media blob source, live static hosting evidence, form endpoint evidence, domain/DNS evidence.
- Missing source proof: live database resource identity and backup/export mechanism.
- Missing connector implementation: database provider connector and media blob copy connector.
- Owner decision required: DB provider mode, media copy mode, artifact retention target, and whether Azure read/export actions are approved.

