# Onboarding Import Integration

`create-onboarding-import` writes local onboarding files:

- `outbound-links.expected.json`
- `outbound-link-policy.json`
- `external-domain-review.md`
- `outbound-link-validation-report.md`

Command:

```powershell
node src/outbound-link-cli.mjs create-onboarding-import --store .tmp/local-store-merged --out .tmp/onboarding-import --overwrite
node src/outbound-link-cli.mjs validate-onboarding-import --import .tmp/onboarding-import
```

Validation behavior:

- allowed domains pass;
- pending-review domains fail readiness until owner review is represented;
- blocked domains fail readiness until remediated;
- disabled state is preserved in expected import files.

The import package is a local proof artifact only. It does not write CMS data or call an onboarding API.
