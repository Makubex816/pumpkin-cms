# Validator Result

## Direct Validator Command

Command:

```powershell
node ..\validator-implementation\src\cli.mjs --package .tmp\real-dry-run-roller-rink-rentals --out .tmp\real-dry-run-roller-rink-rentals --support-packet
```

## Result

| Area | Result |
| --- | --- |
| Overall status | passed |
| Errors | 0 |
| Warnings | 0 |
| Infos | 0 |
| Files checked | 12 |
| External checks | none |
| CMS writes | false |
| Search Console/indexing actions | false |

## Guardrail Result

The validator accepted Roller references only because the generated manifest included exact local-only approval metadata and the package kept no-index/no-live-page hard stops closed.
