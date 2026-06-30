# Pumpkin Tenant Onboarding Execution Runbook

## Preflight

1. Validate the public package locally.
2. Confirm secure handoff readiness without printing secrets.
3. Confirm tenant creation approval.
4. Confirm media upload, deploy, DNS, indexing, and appsetting approvals are either granted or explicitly out of scope.

## Read-Only Review

- Review tenant identity, domains, brand, pages, media manifest, users, theme, forms, publish, monitoring, and validation expectations.
- Confirm no package file contains secrets.

## Approved Write Phases

Writes must be split into narrow phases:

1. Tenant record creation.
2. TenantAdmin identity binding.
3. Page/media/theme/form baseline import.
4. Publish/static output proof.
5. Contact/FormEntry proof.
6. DNS and indexing final gates.

## Cleanup

Each phase must document synthetic records, cleanup paths, and final residual state. Runtime artifacts stay under ignored `.tmp/tenant-onboarding/<tenantId>/`.

## Rollback

Rollback is phase-specific. Do not delete tenants, records, media, or domains unless a separate rollback approval names exact targets.
