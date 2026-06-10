# Validation And Test Plan

## Contract Validation

- Every record has tenant/site scope.
- Link statuses are valid.
- Instance statuses are valid.
- Instances reference known outbound links.
- URLs parse as absolute `http` or `https`.
- Domains match normalized URLs.
- Location paths are safe and deterministic.
- Policy fields use supported values.
- Audit entries are append-only.

## Scanner Tests

- Detect links in structured URL fields.
- Detect links in rich text fields.
- Detect navigation and footer links.
- Detect form/help text links.
- Distinguish new, existing, missing, and stale instances.
- Reject or warn on unsupported URL schemes.
- Never fetch external target URLs.

## Rendering Tests

- Active global link and enabled instance renders anchor.
- Disabled global link renders according to policy.
- Disabled instance overrides active global link.
- Domain-blocked link does not render as clickable.
- Static export uses snapshot state.

## Backup/Restore Tests

- Backup includes link, instance, policy, scan summary, and audit summary files.
- Restore validation compares link count.
- Restore validation compares instance count.
- Restore validation preserves disabled global links.
- Restore validation preserves disabled instances.
- Restore validation preserves rendering fallback policy.

## Security Tests

- Tenant A cannot read Tenant B links.
- Bulk action cannot cross tenant scope accidentally.
- Audit export contains no secrets.
- Scanner does not read protected config.
- Scanner does not perform external crawling.

## Gate Tests

- Publication blocked when required domain review is incomplete.
- Import blocked when blocked domains are present unless owner override is approved.
- Live-readonly scan blocked without explicit approval.
