# Pumpkin New Tenant Intake Readiness V2.8.61O

Status: readiness packet complete; no tenant creation.

## Owner Values Template

Ignored template:

`.tmp/v2-8-61o/owner-input/new-tenant-intake-owner-values.json`

The template contains no secrets. TenantAdmin password material must be handed off outside the repo.

## Required Inputs

- Tenant name.
- Preferred tenant ID.
- Target apex domain.
- Target www domain.
- Source package path.
- Business name and brand notes.
- Primary contact email.
- TenantAdmin email.
- Confirmation that TenantAdmin password material is provided separately.
- DNS strategy.
- Nameserver-change requirement flag.
- Custom-domain cutover request flag.
- Media container preference.
- Expected form types.
- Approval flags for contact POST proof, tenant creation, and media upload.

## Package Intake Flow

1. Confirm owner values are complete.
2. Confirm source package path exists.
3. Run the existing analyzer:
   `node deployment/architecture/pumpkin-platform/tenant-onboarding-package/v1/tools/intake-analyze-package.mjs --zip <zipPath> --out <proofDir> --tenant-id <tenantId>`
4. Resolve analyzer gaps or create owner action packet.
5. Run the existing compiler:
   `node deployment/architecture/pumpkin-platform/tenant-onboarding-package/v1/tools/compile-normalized-package.mjs --analysis <analysisDir> --out <outputDir> --tenant-id <tenantId> --tenant-name <tenantName> --domain <domain> --www-domain <wwwDomain>`
6. Validate package and responsive routes before any preview/deploy request.

## Media, Domain, And Credential Expectations

- Media manifest must identify source assets, target paths, alt text, and ownership.
- No media upload occurs until separately approved.
- Domain policy defaults to provider records only, no nameserver change.
- No custom-domain cutover occurs until separately approved.
- TenantAdmin credential handoff must stay outside the repo.

## Readiness Gates

- Owner values present.
- Package path exists.
- Analyzer passes or owner action packet exists.
- Compiler produces valid package or exact gaps.
- Responsive routes defined.
- Media manifest defined.
- FormDefinition candidates defined.
- Secure TenantAdmin credential handoff exists outside repo.
- Tenant creation approval exists.
- Media upload approval exists.
- Deploy/preview approval exists.
