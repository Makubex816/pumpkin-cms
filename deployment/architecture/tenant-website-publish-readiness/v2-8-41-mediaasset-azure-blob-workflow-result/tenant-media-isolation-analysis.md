# Tenant Media Isolation Analysis

Tenant media target:

- Storage account: `iceskatingmedia`.
- Resource group: `rg-ice-production-media`.
- Container: `ice-rink-rentals-media`.
- Tenant prefix: `ice-rink-rentals/assets/`.
- Proof prefix: `ice-rink-rentals/assets/__pumpkin-proof/v2-8-41/`.
- Public base: `https://iceskatingmedia.blob.core.windows.net/ice-rink-rentals-media`.

Contract references:

- `PUMPKIN_MULTI_TENANT_PLATFORM_CONTRACT.md` states blob media isolation is by storage account/container/prefix mapping.
- `PUMPKIN_ACTIVE_ENDPOINT_CONTRACT_V2_8_36.md` records tenant-scoped MediaAsset metadata routes.
- `PUMPKIN_FUTURE_PHASE_MULTITENANCY_GATE.md` requires each phase to evaluate media tenant separation.

V2.8.41 used only the `ice-rink-rentals` tenant prefix and cleaned the proof prefix back to zero proof blobs.
