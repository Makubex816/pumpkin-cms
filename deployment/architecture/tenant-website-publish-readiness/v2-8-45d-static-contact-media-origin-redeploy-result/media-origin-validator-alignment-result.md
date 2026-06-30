# Media Origin Validator Alignment Result

Root cause classification: static_site_package_validation_failed_media_origin_mismatch.

The generated static output referenced approved current live Azure Blob media URLs. The pre-existing validators allowed only the site canonical media origin, which caused V2.8.45C to block before deployment.

Changed files:

- `deployment/static-azure/validate-static-output.mjs`
- `deployment/static-azure/validate-staging-package.mjs`

Behavior after the change:

- Keep the configured site media origin as allowed.
- Add approved media origins from `PUMPKIN_STATIC_APPROVED_MEDIA_ORIGINS` or `STATIC_APPROVED_MEDIA_ORIGINS`.
- Continue rejecting local-dev media URLs and unapproved image URLs.

Validation after alignment:

| Validator | Result |
| --- | --- |
| `validate-static-output.mjs` | pass |
| `validate-staging-package.mjs` | pass |
