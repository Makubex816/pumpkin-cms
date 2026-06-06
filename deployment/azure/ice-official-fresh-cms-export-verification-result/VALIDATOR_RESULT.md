# Validator Result

Generated: 2026-06-06

## Snapshot Validator

Command:

```text
cd apps/ice-rink-web
npm run validate:snapshot:ice
```

Result:

```json
{
  "ok": true,
  "siteKey": "ice-rink-rentals",
  "tenantId": "ice-rink-rentals",
  "pageCount": 3,
  "fileCount": 5,
  "errors": [],
  "warnings": [
    "contact: staticPublishing.needsRebuild is true.",
    "contact: fulfillment.fulfillmentStatus is missing.",
    "home: staticPublishing.needsRebuild is true.",
    "home: fulfillment.fulfillmentStatus is missing.",
    "service-areas: staticPublishing.needsRebuild is true.",
    "service-areas: non-direct fulfillment should set publicDisclosureRequired before launch."
  ]
}
```

## Strict Static Output Validator

Command:

```text
node deployment/static-azure/validate-static-output.mjs --site ice-rink-rentals --out apps/ice-rink-web/out
```

Result:

```json
{
  "ok": true,
  "siteKey": "ice-rink-rentals",
  "expectedDomain": "iceskatingrinkrentals.com",
  "fileCount": 42,
  "errors": [],
  "warnings": []
}
```

## Strict Staging Package Validator

Command:

```text
node deployment/static-azure/validate-staging-package.mjs --site ice-rink-rentals --folder apps/ice-rink-web/out
```

Result:

```json
{
  "ok": true,
  "siteKey": "ice-rink-rentals",
  "fileCount": 42,
  "errors": [],
  "warnings": []
}
```

Strict validators were run with the approved endpoint URL and `STATIC_FORM_ENDPOINT_VERIFIED=true` in the local validation shell.

No media errors, form endpoint errors, obsolete route errors, preview route errors, or noindex errors were found.
