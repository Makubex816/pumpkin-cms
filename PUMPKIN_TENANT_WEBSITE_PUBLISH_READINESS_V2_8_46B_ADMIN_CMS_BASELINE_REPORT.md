# V2.8.46B Admin CMS Baseline Report

Phase status: closed_success.

Lane: V2.8 Tenant Website / Pumpkin Live Platform Readiness.

Classification: superadmin_ice_cms_baseline_seeding_admin_dashboard_truth_proof.

## Carryforward

V2.8.46A safely deferred deletion of `rg-ice-static-form-endpoint` because the legacy Function App/resource group still showed live request/activity signals. Runtime no-regression was green and no legacy delete/stop action was taken.

## Scope Result

- Active Azure subscription matched `Azure subscription 1` / `ff887def-fd83-4a19-9298-13d4b1687873`.
- Approved owner hard-copy SHA-256 matched `f12c6f8f2afb0da7fbac0788477195e3269b3eeec34c361da7b3b50369ce004d`.
- Admin login succeeded with approved in-memory credentials; returned token was not printed or written to repo files.
- Live auth verified as `TenantAdmin` for `ice-rink-rentals`.
- Initial Admin Page count was `0`; initial MediaAsset count was `0`.
- Seeded 3 permanent Ice Page records: `home`, `contact`, `service-areas`.
- Seeded 9 permanent Ice MediaAsset metadata records for existing Azure Blob assets under `ice-rink-rentals/assets/`.
- Final readback: 3 published pages, 9 active Azure Blob media records, 0 cross-tenant rows returned.

## SuperAdmin

Source confirmed `SuperAdmin = 0` and `TenantAdmin = 1`, but no source-supported live SuperAdmin/user-management creation route was discovered. No SuperAdmin was created. The approved live credential verified as Ice `TenantAdmin`, which was sufficient for tenant-scoped Page and MediaAsset baseline writes.

## Page Baseline

The older local seed files were not used as live write payloads because the contact seed still contained `hello@iceskatingrinkrentals.com` and failed the stricter .NET production contract. V2.8.46B used the later contract-valid live-promotion candidates:

- `content-review/ice-approved-homepage-live-cms-promotion/homepage-live-cms-promotion-candidate.json`
- `content-review/ice-final-contact-live-cms-promotion/CONTACT_LIVE_CMS_PROMOTION_CANDIDATE.json`
- `content-review/ice-service-areas-live-cms-promotion/SERVICE_AREAS_APPROVED_LIVE_CANDIDATE.json`

Each passed `dotnet-page-contract validate-page` before live write.

## Runtime Proof

- Public apex/www `/`, `/contact`, `/service-areas`: HTTP 200.
- Public apex/www `/api/static-contact-health`: HTTP 200.
- Isolated `/api/static-contact-health`: HTTP 200.
- Pumpkin API `/health` and `/api/health`: HTTP 200.
- Admin UI production `/`, `/login`, `/dashboard`, `/dashboard/pages`, `/dashboard/media`: HTTP 200.
- Authenticated Admin FormEntry readback: HTTP 200, count `4`.
- No contact POST, content outside Page/MediaAsset baseline, DNS/indexing, appsetting mutation, storage mutation, key/listKeys/SAS, or deploy occurred.

## Publish Validation

CMS snapshot validation from the newly seeded records passed. Sanitized static validation/build/generate with `STATIC_CONTENT_SOURCE=cms-snapshot` passed from an external temp workspace. No isolated or production deployment was needed or performed.

Known advisory warnings remain in the CMS snapshot for service-area media-origin/staticPublishing metadata, but they did not block local static validate/build/generate and did not require a deploy in this phase.

## Result Package

Result package:

`deployment/architecture/tenant-website-publish-readiness/v2-8-46b-admin-cms-baseline-result/`

Exact-path commit instructions are in `next-phase-prompt.md`.
