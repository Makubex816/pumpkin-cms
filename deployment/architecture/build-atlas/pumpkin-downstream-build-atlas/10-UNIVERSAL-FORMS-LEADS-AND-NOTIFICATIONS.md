# Universal Forms, Leads, and Notifications

## Authoritative flow

```text
Public form
→ tenant-bound starter route
→ payload/schema/honeypot/consent
→ distributed preliminary abuse control
→ tenant/per-form CAPTCHA resolution
→ server verification
→ business validation
→ submission idempotency
→ exactly one FormEntry
→ authoritative readback
→ TenantAdmin/SuperAdmin inbox
→ optional notification workflow
```

## Invariants

- FormEntry is the authoritative lead record.
- Email or other notification delivery is secondary.
- CAPTCHA failure prevents persistence, but notification failure cannot reverse or hide persistence.
- A successful logical submission creates exactly one tenant-scoped FormEntry.
- The same entry is inaccessible through another tenant.
- Contact and notification recipients are mutable tenant/form settings, separate from login identity.
- FormDefinition, FormEntry, notification, CAPTCHA telemetry, and payment records remain separate concerns.

## Required status model

```text
leadPersistence: working | blocked
adminInbox: working | blocked
tenantIsolation: working | blocked
notificationRecipientConfigured: true | false
externalEmailDelivery: implemented_and_proven | implemented_but_unproven | not_implemented | failed
publicFormMode: live | no-post
captcha: disabled | configured_unproven | required_and_proven | blocked
submissionIdempotency: working | blocked
```

The upstream CAPTCHA foundation becomes the shared form-security contract. It does not by itself satisfy exact-one persistence, distributed rate limiting, inboxes, role separation, notifications, or universal tenant proof.
