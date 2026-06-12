# Static Source Validation Result

## Ice

Command:

```text
npm run validate:static:ice
```

Result:

| Field | Value |
| --- | --- |
| Status | passed |
| Page count | 3 |
| Published count | 3 |
| Sitemap count | 3 |
| Redirect count | 0 |
| Warning count | 34 |

Warnings are content-maturity warnings covering workflow approval metadata, revision/rollback metadata, static eligibility metadata, template metadata, fulfillment metadata, service schema metadata, and form configuration metadata. They do not block the route/static-source gate.

## Local Seed Validator

Command:

```text
npm run validate
```

Result:

- passed for `SITE_KEY=ice-rink-rentals`
- validated tenant template, theme, and 3 page documents

## Roller Safety Check

Command:

```text
npm run validate:static:roller
```

Result:

- passed with 31 warnings
- Roller remains paused
