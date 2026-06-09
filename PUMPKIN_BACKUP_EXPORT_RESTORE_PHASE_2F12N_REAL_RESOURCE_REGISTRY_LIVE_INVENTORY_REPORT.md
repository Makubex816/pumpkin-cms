# Pumpkin Backup Export Restore Phase 2F-12N Real Resource Registry Live Inventory Report

Status: complete

## Inventoried

Phase 2F-12N built a real redacted registry for the current Pumpkin/Ice/Roller build using safe read-only sources.

Inventoried resource families:

- Azure subscription and Ice resource groups
- Ice media storage account and container
- Ice Cosmos account, database, and containers
- Ice Static Web App staging resource
- Ice contact form Function App, plan, and storage account
- Ice Cloudflare zone/domain/media worker mappings from safe committed docs
- Ice CMS tenant/site/domain mapping
- Roller paused tenant/API mapping
- Backup Center runtime and handoff status
- credential references without values

## Environment Presence

Presence only, no values:

| Variable | Result |
| --- | --- |
| `PUMPKIN_API_URL` | PRESENT |
| `PUMPKIN_ADMIN_JWT` | PRESENT / excluded-session-token |
| `ROLLER_RINK_RENTALS_API_KEY` | PRESENT |
| `ROLLER_RINK_RENTALS_TENANT_ID` | PRESENT |
| `PUMPKIN_HANDOFF_VAULT_PASSPHRASE` | PRESENT |

## Azure Read-Only Summary

Azure CLI was available and logged in. Only non-secret metadata projections were used.

Resources confirmed included `iceskatingmedia`, `ice-rink-rentals-media`, `cosmos-pumpkin-prod-eastus`, `pumpkin-prod-cms`, the ten model-aligned Cosmos containers, `swa-ice-static-staging`, `func-ice-static-contact-20260605`, `EastUSPlan`, and `iceforms20260605`.

No keys/listKeys, connection strings, SAS generation, app setting values, deployments, or mutations occurred.

## Registry And Handoff

Committed redacted fixtures:

- `resource-registry.real-readonly-current.fixture.json`
- `credential-references.real-readonly-current.fixture.json`

Generated ignored `.tmp` outputs:

- `.tmp/phase-2f12n-real-redacted-registry`
- `.tmp/phase-2f12n-session-handoff-vault`
- `.tmp/phase-2f12n-secure-handoff`

Registry counts:

- resources: 20
- credential references: 9
- tenant mappings: 2
- runtime profiles: 3

Encrypted handoff:

- encrypted durable item count: 1
- excluded item count: 1
- session JWT durable escrow: false
- handoff validation: passed

## Validation

- registry generation: passed
- registry validation: passed
- session vault creation: passed
- vault validation: passed
- secure handoff creation: passed
- secure handoff validation: passed
- `npm test`: passed
- `npm run check`: passed

## Security Boundary

- No secrets printed.
- No plaintext credential files written.
- No protected config files read.
- No generated vault/handoff artifacts staged.
- No Azure mutation, CMS/API write, database export, Cosmos document export, media/blob download, deployment, Search Console/indexing, or live-page publication occurred.
- Cloudflare/domain metadata came from committed safe docs only; no Cloudflare API call occurred in this phase.

## Readiness Classification

- Phase 2F-12M implementation: complete
- Phase 2F-12N live inventory: yes
- real redacted registry generated: yes
- encrypted handoff regenerated: yes
- generated output staged: no
- Azure mutations: no
- protected config read: no
- plaintext secret export: no
- ready for Backup Center operationalization prompt: yes

## Next

Use the Phase 2F-12N result package prompt for Backup Center operationalization and registry integration planning.
