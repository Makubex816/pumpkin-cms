# V2.8.62DRT Generic Tenant Redirect Support Result

Phase status: `blocked_after_single_api_deploy_live_internal_redirect_validation_cross_platform_path_detection`.

Pumpkin now has a generic tenant-scoped redirect model, Admin contract, Cosmos and Mongo data-layer support, versioned backup representation, import planner, cycle/conflict validation, and local starter middleware. All focused local tests and Release builds pass.

The one approved Pumpkin API deployment completed successfully and the new Admin routes are live and auth-gated. Authenticated read-only validation then exposed a Linux-only path-classification defect in the deployed build: leading-slash internal routes were interpreted as absolute file URIs and both Vegas payloads returned HTTP `400`. The defect is corrected locally, rebuilt, and packaged outside the repo, but that corrected package was not deployed because the one-deploy phase limit was exhausted.

No Vegas redirect, page, domain, audit, media, form, credential, Ice, or Party Pros data was mutated. The generic Vegas redirect registry remains empty, the existing page-owned redirect count remains `1`, runtime no-regression passed `39/39` GET checks, and Airstrip received zero requests.

V2.8.62DRU must first receive separate approval to deploy and prove the corrected API build. It must not create the two Vegas redirect records until both live validation calls return HTTP `200` and `persistable: true`.
