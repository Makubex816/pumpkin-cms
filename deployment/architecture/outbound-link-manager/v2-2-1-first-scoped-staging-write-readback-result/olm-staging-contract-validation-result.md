# OLM Staging Contract Validation Result

Status: passed.

The V2.3.4 contract values were supplied for validation:

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

Validator result:

```text
fields: 10
present: 10
missing: 0
placeholder: 0
blocked: 0
failures: 0
packageLinkage: passed
approvalManifestIdMatched: true
firstWriteBatchIdMatched: true
expectedRecordCountMatched: true
realStagingProviderWritePerformed: false
```

No secret values were printed.
