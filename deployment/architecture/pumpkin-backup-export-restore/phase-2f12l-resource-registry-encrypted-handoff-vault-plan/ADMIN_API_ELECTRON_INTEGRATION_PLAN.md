# Admin API and Electron Integration Plan

## Admin UI

Future Admin UI should expose:

- Resource registry browser
- Tenant resource map
- Runtime profile status
- Credential reference checklist without values
- Rotation and cleanup tasks
- Backup Center registry validation result
- Handoff package readiness state

## Pumpkin API

Future Pumpkin API should expose authenticated, audited endpoints for:

- Redacted registry reads
- Registry validation status
- Tenant/resource mapping reads
- Runtime profile status
- Handoff vault readiness metadata without payload values

## Electron

Future Electron app should orchestrate local/private registry and vault workflows:

- Local registry validation
- Encrypted vault creation after explicit approval
- Vault download/open workflow
- Owner handoff checklist
- Rotation/cleanup confirmation

## Boundary

No Admin UI, API endpoint, or Electron implementation is approved in Phase 2F-12L.

