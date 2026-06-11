# OLM Staging Env Contract Validation

Validator:

```text
node src/outbound-link-cli.mjs validate-staging-env-contract
```

Working directory:

```text
deployment/architecture/outbound-link-manager/local-scanner-registry-implementation/
```

Result:

| Metric | Value |
| --- | --- |
| Status | `passed` |
| Fields | `10` |
| Present | `10` |
| Missing | `0` |
| Placeholder | `0` |
| Blocked | `0` |
| Failures | `0` |
| Values printed | no |

No package linkage validation was run because this phase did not rebuild or execute the first-write package.

