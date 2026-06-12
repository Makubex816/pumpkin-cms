# Publish Gate Revalidation Result

Status: local static integrity revalidated; external approval gates remain blocked.

Commands:

```text
npm run build:static:ice:sanitized
npm run validate:static:ice
npm run type-check
node deployment/static-azure/validate-static-output.mjs --site ice-rink-rentals --out apps/ice-rink-web/.tmp/sanitized-static-build/ice-rink-rentals/sanitized_20260612171036/repo/apps/ice-rink-web/out
node deployment/static-azure/validate-staging-package.mjs --site ice-rink-rentals --folder apps/ice-rink-web/.tmp/sanitized-static-build/ice-rink-rentals/sanitized_20260612171036/repo/apps/ice-rink-web/out
```

Results:

- Sanitized build passed.
- Static source validation passed with existing quality warnings.
- Type-check passed.
- Static output validator: expected no-go, local static integrity passed, 2 external gates.
- Staging package validator: expected no-go, local static integrity passed, 2 external gates.

External gates:

- `static-form-endpoint-configured`
- `static-form-backend-verification`
