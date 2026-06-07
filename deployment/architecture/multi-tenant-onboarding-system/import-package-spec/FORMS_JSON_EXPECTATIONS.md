# Forms JSON Expectations

`forms.json` defines public forms and routing decisions.

Required per form:

- `formId`
- `tenantId`
- `siteKey`
- `displayName`
- `deliveryMode`
- `recipient`
- `mailboxOwner`
- `fields`
- `consentNoticeStatus`
- `rollbackMode`

Rules:

- Delivery mode may be `no-email`, `graph`, `webhook`, or `profile-managed`.
- Live email tests require separate approval.
- Microsoft 365 secrets are never stored in this file.

