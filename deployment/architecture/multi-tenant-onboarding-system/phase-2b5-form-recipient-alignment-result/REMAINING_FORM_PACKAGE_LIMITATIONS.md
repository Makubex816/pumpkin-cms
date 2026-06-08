# Remaining Form Package Limitations

- `recipient` remains allowed as optional legacy/display metadata, but generated packages do not emit it.
- `leadRecipientRef` is a reference only; it does not prove endpoint configuration exists.
- `staticEndpointRef` remains placeholder/profile-managed only.
- No email delivery, Microsoft 365, webhook, Azure Function, DNS, or external endpoint check is performed.
- The validator confirms reference shape and consistency, not live form delivery.
- Support reports include local absolute paths and should be redacted before external ticketing.
- Real tenant pilot execution still needs separate owner/operator approval and external-action approvals.
