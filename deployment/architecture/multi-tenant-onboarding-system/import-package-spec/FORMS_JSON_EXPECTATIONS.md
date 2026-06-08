# Forms JSON Expectations

`forms.json` defines public forms and routing decisions.

Required per form:

- `formId`
- `displayName`
- `deliveryMode`
- `leadRecipientRef` or legacy `recipientGroup`
- `mailboxOwner`
- `fields`
- `consentNoticeStatus`
- `rollbackMode`

Rules:

- Delivery mode may be `no-email`, `graph`, `webhook`, or `profile-managed`.
- `leadRecipientRef` is the import package recipient reference for frontend/contact form wiring.
- `recipientGroup` is the legacy backend compatibility field. If both `leadRecipientRef` and `recipientGroup` are present, they must use the same safe reference value.
- Recipient references must use lowercase letters, numbers, and hyphens, such as `example-event-leads`.
- Recipient references must not contain passwords, tokens, connection strings, signed URLs, email credentials, local paths, or platform secrets.
- `staticEndpointRef` remains a placeholder or profile-managed reference only, such as `PROFILE_MANAGED_STATIC_ENDPOINT`.
- `domainRoutingKey` may be used for a safe deployment-profile routing key; it follows the same lowercase reference format.
- `recipient` is optional legacy/display metadata only. New generated packages should use `leadRecipientRef` and must not rely on raw recipient emails for routing.
- `leadRecipientRef` maps later to approved endpoint recipient configuration outside the import package.
- Live email tests require separate approval.
- Microsoft 365 secrets are never stored in this file.
