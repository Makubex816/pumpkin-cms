# Phase 2F-10B Cosmos/Media Connector Implementation Plan

## Purpose

This package defines the exact implementation plan for IceSkatingRinkRentals.com database and media backup connectors after the Phase 2F-10A source-of-truth wiring work.

Phase 2F-10A changed the database direction: Azure SQL is no longer the primary assumption. The production database path should be treated as provider-based storage with Cosmos DB as the likely live provider unless later read-only evidence proves otherwise.

## Result

- Phase 2F-10A source wiring plan: complete
- Phase 2F-10B connector implementation plan: yes
- Ice fully backupable today: no
- Cosmos/database connector plan: yes
- Media blob connector plan: yes
- Tenant website bundle integration plan: yes
- Ready for connector implementation approval: yes
- Implementation performed: no
- External systems changed: no
- Live pages affected: no

## Planning Boundaries

This package is documentation only. It does not implement connectors, export Cosmos data, download blobs, read protected config, export secrets, modify Azure resources, write to CMS, deploy code, or publish live pages.

## Package Files

- `IMPLEMENTATION_SCOPE.md`
- `NON_GOALS.md`
- `PHASE_2F10A_FINDINGS_SUMMARY.md`
- `COSMOS_DATABASE_BACKUP_DIRECTION.md`
- `COSMOS_READ_ONLY_DISCOVERY_PLAN.md`
- `COSMOS_PLATFORM_BACKUP_EVIDENCE_PLAN.md`
- `PORTABLE_COSMOS_JSON_EXPORT_PLAN.md`
- `MEDIA_BLOB_CONNECTOR_PLAN.md`
- `TENANT_WEBSITE_BUNDLE_INTEGRATION_PLAN.md`
- `LOCAL_DEV_AND_LIVE_AZURE_PROFILE_PLAN.md`
- `ENV_AND_TOOLING_READINESS_MATRIX.md`
- `MANIFEST_CHECKSUM_INTEGRATION_PLAN.md`
- `VALIDATOR_CONTRACT_UPDATE_PLAN.md`
- `RESTORE_PLAN_UPDATE_PLAN.md`
- `IMPLEMENTATION_BATCHES.md`
- `TEST_FIXTURE_PLAN.md`
- `RISK_REGISTER.md`
- `NEXT_COSMOS_MEDIA_CONNECTOR_IMPLEMENTATION_PROMPT.md`
- `manifest.json`
