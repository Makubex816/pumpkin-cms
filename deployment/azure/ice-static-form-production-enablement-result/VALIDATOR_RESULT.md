# Validator Result

Generated: 2026-06-06

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

Both validators were run with the approved endpoint URL and `STATIC_FORM_ENDPOINT_VERIFIED=true` in the local validation shell.

