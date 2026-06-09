# Pumpkin Backup Export Restore Phase 2F-10A Ice Source Wiring Tenant Bundle Plan Report

Date: 2026-06-09

Target: IceSkatingRinkRentals.com

## Executive Result

Phase 2F-10A created the Ice source-of-truth wiring and tenant website bundle architecture package. It uses Phase 2F-10 blocker evidence, safe local docs/source, and allowed read-only Azure discovery to clarify how Ice becomes fully backupable without breaking local development workflows.

No implementation, database export, blob download, protected config read, secret export, CMS write, Azure mutation, Cloudflare change, DNS change, deployment, email action, Search Console/indexing action, or live-page publication occurred.

## Phase 2F-10 Blocker Summary

Phase 2F-10 produced a validated standard backup candidate, but production restore proof was not achieved because:

- database artifact proof was blocked;
- media blob copy proof was blocked;
- media metadata was included but binaries were not copied;
- validator and restore dry-run passed only for available inventory.

## Source-Of-Truth Summary

| Layer | Status |
| --- | --- |
| CMS/API content | Wired for read-only standard backup |
| Database source | Partial; provider discovery required |
| Media metadata | Wired through CMS MediaAsset export |
| Media blob source | Partial; Azure storage/container discovered |
| Static/live site evidence | Partial; safe docs identify live Azure SWA and domains |
| Contact endpoint | Documented no-email/dry-run Azure Function endpoint |
| DNS/Cloudflare | Documented from prior safe cutover reports |
| Config inventory | Presence-only model |
| Restore validation | Local dry-run only |

## Read-Only Azure Discovery

Azure CLI was available and logged in. Read-only discovery found:

- resource groups: `rg-ice-production-media`, `rg-ice-static-form-endpoint`, `DefaultResourceGroup-EUS`, `rg-ice-static-staging`;
- storage accounts: `iceskatingmedia`, `iceforms20260605`;
- media container: `ice-rink-rentals-media`;
- Azure SQL servers: none returned by `az sql server list`.

No keys, app settings, connection strings, SAS URLs, blob contents, database exports, or secret values were read or printed.

## Database Source Plan

The database backup connector must be provider-aware. Safe source/docs show the API routes data operations through `DatabaseService`, with Cosmos DB and MongoDB implementations. Ice production architecture docs identify the database provider as Azure Cosmos DB. Azure SQL discovery returned no SQL servers.

Recommendation: implement provider discovery and a Cosmos backup/evidence connector before any Azure SQL-specific export work. Keep Azure SQL/BACPAC as an optional future connector only if a later discovery proves it is the live source.

## Media Source Plan

Media backup can now be wired to the live Azure media source:

- account: `iceskatingmedia`;
- container: `ice-rink-rentals-media`;
- public host: `media.iceskatingrinkrentals.com`;
- URL pattern: checksum-versioned media path under `/ice-rink-rentals/assets/`.

Recommendation: implement media source discovery, MediaAsset-to-blob mapping, read-only blob inventory, and then separately approved blob copy modes.

## Tenant Bundle Model

The package defines a safe public_html-style tenant bundle:

- `public/` for generated static visitor output;
- `cms-content/` for editable CMS source exports;
- `media/metadata/` and `media/blobs/` separated;
- `config-inventory/` redacted only;
- `backups/` for manifests/references, not Git-staged binary artifacts;
- `restore/` for dry-run and proof reports;
- `operator-handoff/` for approvals, DNS, rollback, form/email, and support notes.

## Readiness Classification

| Item | Status |
| --- | --- |
| Phase 2F-10 baseline blocker documented | Complete |
| Phase 2F-10A source wiring plan | Yes |
| Ice fully backupable today | No |
| DB source wired for backup | Partial |
| Media blob source wired for backup | Partial |
| Tenant website bundle model defined | Yes |
| Local dev profile preserved | Yes |
| Live Azure read profile defined | Yes |
| Implementation performed | No |
| External systems changed | No |
| Live pages affected | No |

## Next Step

Proceed to Phase 2F-10B implementation planning for source profiles and DB/media backup connectors. Do not implement connectors, export databases, copy blobs, or perform restore work until the next explicit approval.

