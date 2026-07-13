# V2.8.62DRT Generic Tenant Redirect Support Report

Status: `blocked_after_single_api_deploy_live_internal_redirect_validation_cross_platform_path_detection`.

V2.8.62DRT implemented Pumpkin's reusable tenant redirect contract across the model, Admin/runtime APIs, authorization, normalization, conflict/cycle validation, Cosmos and Mongo providers, backup representation, import planning, and local starter middleware. Focused tests pass, the actual Vegas dry-run produces two deterministic future actions with zero blockers/cycles, API Release build passes with 0 warnings/errors, and starter local build/test proof passes.

Exactly one Pumpkin API deployment ran. Azure reported `RuntimeSuccessful` with deployment ID `0facfa2a-b9fd-4a98-9597-528219c84f00`. The new Admin routes return `401` without auth and the authenticated list returns `0` generic Vegas records.

Authenticated validation exposed a Linux-only defect in the deployed package: leading-slash internal routes were treated as absolute file URIs, so both Vegas payloads returned HTTP `400` with `source.invalid` and `target.invalid`. The source is corrected locally and a safe corrected package was built outside the repo, but DRT's one-deploy allowance was exhausted. No second deploy was attempted.

No tenant redirect/page/domain/audit/media/form/credential mutation occurred. Vegas remains at 43 pages and 1 page-owned redirect; Ice and Party Pros are unchanged. Runtime no-regression passed 39/39 GET checks. No DNS, TLS, publication, indexing, form/contact POST, FormEntry, storage-key/SAS, or Airstrip action occurred.

The complete evidence package is in `deployment/architecture/tenant-website-publish-readiness/v2-8-62drt-generic-redirect-support-result/`. V2.8.62DRU must first obtain separate corrected API deployment approval and prove both live validations before creating the two Vegas records.
