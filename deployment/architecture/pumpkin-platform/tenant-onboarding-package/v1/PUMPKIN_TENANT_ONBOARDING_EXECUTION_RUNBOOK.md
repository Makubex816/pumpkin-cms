# Pumpkin Tenant Onboarding Execution Runbook

## Preflight

1. Validate the public package locally.
2. Confirm responsive readiness is declared for packages converted or updated after V2.8.60V.
3. Confirm secure handoff readiness without printing secrets.
4. Confirm tenant creation approval.
5. Confirm media upload, deploy, DNS, indexing, and appsetting approvals are either granted or explicitly out of scope.

## Read-Only Review

- Review tenant identity, domains, brand, pages, media manifest, users, theme, forms, publish, monitoring, validation expectations, and responsive route/viewport expectations.
- Confirm no package file contains secrets.
- Confirm responsive proof is GET/browser-only and has no form submission, contact POST, media upload, content write, deploy, DNS, or indexing action.

## Approved Write Phases

Writes must be split into narrow phases:

1. Tenant record creation.
2. TenantAdmin identity binding.
3. Page/media/theme/form baseline import.
4. Publish/static output proof.
5. Responsive output proof on local or isolated preview.
6. Responsive output proof on production default host before custom-domain work.
7. Contact/FormEntry proof.
8. DNS and indexing final gates.

## Cleanup

Each phase must document synthetic records, cleanup paths, and final residual state. Runtime artifacts stay under ignored `.tmp/tenant-onboarding/<tenantId>/`.

## Rollback

Rollback is phase-specific. Do not delete tenants, records, media, or domains unless a separate rollback approval names exact targets.
