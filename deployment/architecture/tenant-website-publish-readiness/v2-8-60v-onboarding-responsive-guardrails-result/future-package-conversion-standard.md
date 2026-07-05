# Future Package Conversion Standard

Status: active recommendation.

Every future tenant package conversion must:

1. Produce a normalized package with `validation/expected-routes.json`.
2. Set `responsiveReadinessRequired` to `true`.
3. Include `validation/responsive-routes.json` with the V2.8.60V viewport matrix.
4. Run `validate-tenant-package.mjs` before requesting live mutation.
5. Run `check-responsive-output.mjs` against local or isolated output before production proof.
6. Run `check-responsive-output.mjs` against the production default host before custom-domain or DNS work.
7. Stop before custom-domain cutover if any selected route has horizontal overflow, failed navigation, missing images, unexpected console errors, unexpected failed requests, or unexpected bad responses.

Legacy packages may validate with a warning, but their conversion output still needs responsive proof before cutover.
