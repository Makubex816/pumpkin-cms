# Validator Result

Generated: 2026-06-05

All validator commands used the no-email endpoint URL and `STATIC_FORM_ENDPOINT_VERIFIED=true` only in local shell context.

## Results

| Command | Exit | Result |
| --- | --- | --- |
| `npm run validate:snapshot:ice` | 0 | pass with existing non-form warnings |
| `node deployment/static-azure/validate-static-output.mjs --site ice-rink-rentals --out apps/ice-rink-web/out` | 0 | pass |
| `node deployment/static-azure/validate-staging-package.mjs --site ice-rink-rentals --folder apps/ice-rink-web/out` | 0 | pass |

## Strict Static Output Validator

Result:

```text
ok=true
fileCount=42
errors=[]
warnings=[]
```

## Strict Staging Package Validator

Result:

```text
ok=true
fileCount=42
errors=[]
warnings=[]
```

## Snapshot Validator Warnings

Existing non-form warnings remain:

- `staticPublishing.needsRebuild is true`
- missing fulfillment metadata on `contact` and `home`
- non-direct fulfillment disclosure warning on `service-areas`

These warnings do not block the strict static/staging validators.

## Classification

Static output quality gates:

```text
yes for local/staging no-email validation context
```

Contact form production readiness:

```text
no
```
