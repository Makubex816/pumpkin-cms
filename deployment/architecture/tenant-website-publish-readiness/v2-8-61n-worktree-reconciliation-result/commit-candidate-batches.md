# Commit Candidate Batches

Status: recommendation only.

No staging occurred.

Recommended commit batches:

## Batch 1: V2.8.61N Reconciliation Packet

Commit only the current V2.8.61N report package and durable docs.

## Batch 2: Multi-Tenant Onboarding System Docs

Candidate tracked docs:

- Root platform tracker/source-of-truth docs.
- `deployment/architecture/multi-tenant-onboarding-system/`.

Review requirement:

- Confirm this is an intentional documentation expansion before staging all tracked docs.

## Batch 3: Multi-Tenant Onboarding V2.11/V2.12 Report Results

Candidate untracked reports/results:

- `PUMPKIN_MULTI_TENANT_ONBOARDING_V2_11_*`
- `PUMPKIN_MULTI_TENANT_ONBOARDING_V2_12_*`
- `deployment/architecture/multi-tenant-onboarding/v2-11-*`
- `deployment/architecture/multi-tenant-onboarding/v2-12-*`

## Batch 4: Outbound Link Manager Report Results

Candidate reports/results:

- `PUMPKIN_OUTBOUND_LINK_MANAGER_PHASE_2H*`
- `deployment/architecture/outbound-link-manager/phase-2h*`

## Batch 5: Backup/Restore Planning Reports

Candidate reports/results:

- `PUMPKIN_BACKUP_EXPORT_RESTORE_PHASE_2F12*`
- `deployment/architecture/pumpkin-backup-export-restore/phase-2f12*`

## Batch 6: Tenant Website Readiness Historical Reports

Candidate reports/results:

- `PUMPKIN_TENANT_WEBSITE_PUBLISH_READINESS_V2_8_16_*`
- `PUMPKIN_TENANT_WEBSITE_PUBLISH_READINESS_V2_8_19*`
- `PUMPKIN_TENANT_WEBSITE_PUBLISH_READINESS_V2_8_45C_*`
- `PUMPKIN_TENANT_WEBSITE_PUBLISH_READINESS_V2_8_54E_*`
- `PUMPKIN_TENANT_WEBSITE_PUBLISH_READINESS_V2_8_61_BLUEHOST_DNS_BINDING_REPORT.md`
- matching `deployment/architecture/tenant-website-publish-readiness/v2-8-*` result folders.

## Batch 7: Source Review Batches

Do not mix with reports. Separate source review lanes:

- ImportExecution projection source and tests.
- OperatorHandoff source and tests.
- Provider metadata service.
- Admin UI scripts/components/libs.
- Ice web source changes.
- OLM docs and future write-action docs.
- Package dist outputs, if approved.
