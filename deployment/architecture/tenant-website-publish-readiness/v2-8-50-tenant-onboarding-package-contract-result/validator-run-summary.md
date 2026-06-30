# Validator Run Summary

Blank template:

- Command: `node .../validate-tenant-package.mjs .../examples/blank-tenant-template`
- Valid: true.
- Errors: 0.
- Warnings: 1.
- Output: `.tmp/tenant-onboarding/blank-tenant/validation-summary.json`

Ice retrofit:

- Command: `node .../validate-tenant-package.mjs .../examples/ice-rink-rentals`
- Valid: true.
- Errors: 0.
- Warnings: 2.
- Output: `.tmp/tenant-onboarding/ice-rink-rentals/validation-summary.json`

Generated `.tmp` validator output was not staged.
