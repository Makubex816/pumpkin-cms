# OLM Staging Environment Contract

Canonical required fields:

- `OLM_STAGING_PROVIDER_PROFILE_ID`
- `OLM_STAGING_PROVIDER_TYPE`
- `OLM_STAGING_PROVIDER_MODE`
- `OLM_STAGING_RESOURCE_SCOPE`
- `OLM_STAGING_ACCOUNT_OR_HOST`
- `OLM_STAGING_DATABASE_OR_NAMESPACE`
- `OLM_STAGING_RBAC_OR_AUTH_MODE`
- `OLM_STAGING_IDENTITY_OR_SESSION_TYPE`
- `OLM_STAGING_READBACK_METHOD`
- `OLM_STAGING_ROLLBACK_METHOD`

Validator:

```text
node src/outbound-link-cli.mjs validate-staging-env-contract --package .tmp/phase-2h22-staging-execution-package
```

The validator reports:

- `present`
- `missing`
- `placeholder`
- `blocked`
- safe-to-commit metadata only

The validator does not print values. It may inspect the process environment for presence only and may inspect the ignored `.tmp` execution package for manifest and batch linkage.

Current result:

- field count: `10`
- present: `0`
- missing: `10`
- package linkage: passed
- final status: blocked

The contract must pass before any future first scoped staging write reattempt.

