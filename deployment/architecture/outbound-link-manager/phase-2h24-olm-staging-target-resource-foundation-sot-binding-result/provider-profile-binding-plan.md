# Provider Profile Binding Plan

The future real scoped staging provider profile must be a distinct profile, not the existing `staging-execution-profile` staging-simulated profile.

## Required Shape

| Field | Requirement |
| --- | --- |
| profile ID | Supplied by `OLM_STAGING_PROVIDER_PROFILE_ID` |
| provider type | Supplied by `OLM_STAGING_PROVIDER_TYPE` |
| provider mode | Supplied by `OLM_STAGING_PROVIDER_MODE` |
| resource scope | Supplied by `OLM_STAGING_RESOURCE_SCOPE` |
| account/host | Supplied by `OLM_STAGING_ACCOUNT_OR_HOST` |
| database/namespace | Supplied by `OLM_STAGING_DATABASE_OR_NAMESPACE` |
| auth/session mode | Supplied by `OLM_STAGING_RBAC_OR_AUTH_MODE` |
| identity/session type | Supplied by `OLM_STAGING_IDENTITY_OR_SESSION_TYPE` |
| readback method | Supplied by `OLM_STAGING_READBACK_METHOD` |
| rollback method | Supplied by `OLM_STAGING_ROLLBACK_METHOD` |
| tenant scope | Must match approved package tenant/site scope |
| approval linkage | Must match `olapprove_508df3f03faa4f80` |
| batch linkage | Must match `olbatch_b08e184fdc6565aa` |

## Provider Mode Rules

- `staging-simulated`: allowed only for local `.tmp` evidence, not real write execution.
- `production-runtime`: blocked for the scoped staging write.
- Proposed future real write mode: `staging-live-write-approved` or equivalent repo-supported explicitly scoped staging write-approved profile.

## Provider Profile Acceptance

The profile cannot be accepted until it is represented in SOT, Resource Registry, Backup Center pre-write evidence, Runtime QA evidence, readback, rollback, and no-go criteria.

