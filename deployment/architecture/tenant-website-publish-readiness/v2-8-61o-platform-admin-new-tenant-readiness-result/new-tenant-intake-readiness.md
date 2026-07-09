# New Tenant Intake Readiness

Status: readiness prepared; no tenant created.

## Required Owner Inputs

- `tenantName`
- `tenantIdPreferred`
- `targetDomain`
- `wwwDomain`
- `sourcePackagePath`
- `businessName`
- `brandNotes`
- `primaryContactEmail`
- `tenantAdminEmail`
- `tenantAdminPasswordProvidedSeparatelyBoolean`
- `dnsStrategy`
- `nameserverChangeRequiredBoolean`
- `customDomainCutoverRequestedBoolean`
- `mediaContainerPreference`
- `formTypesExpected`
- `contactPostProofApprovedBoolean`
- `tenantCreationApprovedBoolean`
- `mediaUploadApprovedBoolean`
- `notes`

## Default Policy

- No tenant creation until separate approval.
- No media upload until separate approval.
- No custom-domain cutover until separate approval.
- No nameserver changes by default.
- No contact/form/customer-facing POST proof by default.
- Use package analyzer first.
- Use package compiler second.
- Run responsive/mobile guardrails before preview/deploy.
- Create backup/recovery plan before production cutover.
