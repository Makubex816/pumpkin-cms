# Evidence Binding Schema Summary

Result: implemented.

The evidence binding schema is defined in:

```text
deployment/architecture/audit-jobs-production-promotion/audit-job-ledger-implementation/src/audit-job-ledger-schema.mjs
deployment/architecture/audit-jobs-production-promotion/audit-job-ledger-implementation/schemas/evidence-binding.schema.md
```

Required fields include `evidenceId`, `evidenceType`, `sourceRef`, `safePath`, and `summary`.

Evidence bindings must use repo-relative safe paths. Protected config, credential, cookie, auth, token, secret, private-key, and key-vault-like paths are rejected.

Production artifact evidence requires `artifactHash` as a lowercase SHA-256 value.
