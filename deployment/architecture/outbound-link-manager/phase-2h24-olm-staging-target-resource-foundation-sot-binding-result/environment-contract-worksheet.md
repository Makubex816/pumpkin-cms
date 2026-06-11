# Environment Contract Worksheet

This worksheet is safe to commit. It records classification and operator action only.

| Field | Status | Safe to commit | Placeholder allowed | Proposed source | Operator action |
| --- | --- | --- | --- | --- | --- |
| `OLM_STAGING_PROVIDER_PROFILE_ID` | missing | yes, identifier only | no | Provider profile registry | Provide approved scoped staging profile ID. |
| `OLM_STAGING_PROVIDER_TYPE` | missing | yes, type label only | no | Provider profile registry/resource foundation | Provide concrete provider type. |
| `OLM_STAGING_PROVIDER_MODE` | missing | yes, mode label only | no | Provider mode gate | Provide scoped staging live-write-approved mode; not `staging-simulated` or `production-runtime`. |
| `OLM_STAGING_RESOURCE_SCOPE` | missing | yes, non-secret identifier only | no | Staging resource foundation worksheet | Provide non-production scope identifier. |
| `OLM_STAGING_ACCOUNT_OR_HOST` | missing | yes, non-secret identifier only | no | Staging resource foundation worksheet | Provide non-production account/host. |
| `OLM_STAGING_DATABASE_OR_NAMESPACE` | missing | yes, non-secret identifier only | no | Staging resource foundation worksheet | Provide non-production database/namespace. |
| `OLM_STAGING_RBAC_OR_AUTH_MODE` | missing | yes, mode label only | no | RBAC/session review | Provide mode label without values. |
| `OLM_STAGING_IDENTITY_OR_SESSION_TYPE` | missing | yes, type label only | no | RBAC/session review | Provide identity/session type without credentials. |
| `OLM_STAGING_READBACK_METHOD` | missing | yes, method name only | no | Readback method registry | Provide concrete method name and scope. |
| `OLM_STAGING_ROLLBACK_METHOD` | missing | yes, method name only | no | Rollback method registry | Provide concrete method tied to `olbatch_b08e184fdc6565aa`. |

The future validator command must pass before any write reattempt:

```text
node src/outbound-link-cli.mjs validate-staging-env-contract --package .tmp/phase-2h22-staging-execution-package
```

