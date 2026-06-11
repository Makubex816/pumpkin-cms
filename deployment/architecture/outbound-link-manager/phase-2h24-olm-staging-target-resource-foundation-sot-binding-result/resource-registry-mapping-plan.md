# Resource Registry Mapping Plan

The Resource Registry must record only non-secret staging target metadata and credential references without values.

| Registry field | Source |
| --- | --- |
| provider profile ID | `OLM_STAGING_PROVIDER_PROFILE_ID` |
| provider type | `OLM_STAGING_PROVIDER_TYPE` |
| provider mode | `OLM_STAGING_PROVIDER_MODE` |
| resource scope | `OLM_STAGING_RESOURCE_SCOPE` |
| account or host | `OLM_STAGING_ACCOUNT_OR_HOST` |
| database or namespace | `OLM_STAGING_DATABASE_OR_NAMESPACE` |
| credential reference | Derived from `OLM_STAGING_RBAC_OR_AUTH_MODE` and `OLM_STAGING_IDENTITY_OR_SESSION_TYPE`; no values |
| readback method reference | `OLM_STAGING_READBACK_METHOD` |
| rollback method reference | `OLM_STAGING_ROLLBACK_METHOD` |
| approval linkage | `olapprove_508df3f03faa4f80` |
| batch linkage | `olbatch_b08e184fdc6565aa` |

Resource Registry write status for 2H-24: not performed.

Current registry source remains Phase 2F-12N real redacted inventory. Future OLM registry mapping must be generated as a candidate first, then reviewed before any write.

