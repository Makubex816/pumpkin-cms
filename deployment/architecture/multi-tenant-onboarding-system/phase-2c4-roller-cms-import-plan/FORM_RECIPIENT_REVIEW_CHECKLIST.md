# Form Recipient Review Checklist

Complete before any CMS import execution approval.

## Current Local Package Form State

| Field | Value |
| --- | --- |
| Form ID | contact-form |
| Delivery mode | no-email |
| Lead recipient ref | roller-rink-leads |
| Legacy recipient group | roller-rink-leads |
| Static endpoint ref | PROFILE_MANAGED_STATIC_ENDPOINT |
| Consent notice status | pending-review |
| Rollback mode | disable-form |

## Review Checklist

- [ ] `leadRecipientRef` is approved as a safe non-secret reference.
- [ ] `recipientGroup` matches `leadRecipientRef`.
- [ ] Delivery mode remains `no-email`.
- [ ] No mailbox password, Microsoft Graph secret, SMTP password, token, or connection string is present.
- [ ] Form fields are approved for draft/preview import planning.
- [ ] Consent/notice text status is accepted for draft/preview planning.
- [ ] Form oversight owner is confirmed.
- [ ] Future email/form test remains a separate gate.

## Hard Stops

- No email sending.
- No Microsoft 365 work.
- No Function App setting changes.
- No live form submissions.
- No production endpoint activation.
