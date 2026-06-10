# Onboarding Tenant Bundle Implementation Plan

No onboarding or tenant bundle implementation is approved in Phase 2H-2.

## Future Import Package Files

- `outbound-links.expected.json`
- `outbound-link-policy.json`
- `external-domain-review.md`
- `outbound-link-validation-report.md`

## Future Tenant Bundle Files

```text
tenants/{tenantKey}/sites/{siteKey}/outbound-links/
  outbound-links.json
  outbound-link-instances.json
  outbound-link-policy.json
  outbound-link-scan-runs.json
  outbound-link-validation-report.md
```

## Validation Gates

- Unreviewed domains block publication.
- Blocked domains block import unless owner override is documented.
- Links missing expected registry entries produce validation failures.
- Disabled state must survive bundle export/import.

## Phase 2H-3 Handling

Use fake tenant bundle and fake import package fixtures only.
