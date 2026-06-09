# Implementation Scope

## Approved Scope Completed

- Added Backup Center runtime profile model in `src/provider/runtime-profile-model.mjs`.
- Added runtime profile bundle writer in `src/provider/runtime-profile-writer.mjs`.
- Extended runtime profile bridge output with resolved runtime profile state.
- Integrated runtime profile status into standard backup folder bundles.
- Added fake complete export guard enforcement.
- Added runtime profile CLI commands.
- Added runtime profile fixtures.
- Added tests for local/offline/fake/read-only/future/write-blocked profiles.
- Added operator docs.

## API Scope

No Pumpkin API source changes were required for Phase 2F-12K. The Phase 2F-12I provider metadata endpoint foundation remains the API-side contract foundation, and Backup Center now maps that style of non-secret provider metadata into runtime profile guard decisions.

## Scope Not Entered

- Production runtime switching
- Data seed or migration
- Live database export
- Live Cosmos export
- Live CMS/API calls
- Azure mutation
- Protected config reads
- Deployment

