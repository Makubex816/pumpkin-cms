# Outbound Email Log Contract

`OutboundEmailLog` records Pumpkin application email attempts without storing secrets or full raw payloads.

This model is a contract for future implementation. No database container is created in this phase.

## Shape

```json
{
  "id": "email-log-id",
  "tenantId": "ice-rink-rentals",
  "siteKey": "ice-rink-rentals",
  "providerKey": "pending-provider-decision",
  "templateKey": "ice-lead-notification-default",
  "messageType": "lead-notification",
  "relatedEntityType": "FormEntry",
  "relatedEntityId": "form-entry-id",
  "formEntryId": "form-entry-id",
  "recipientEmailHash": "sha256-or-provider-safe-hash",
  "recipientEmailSummary": "admin mailbox ref or masked recipient",
  "recipientEmail": "",
  "fromAddressRef": "ICE_RINK_RENTALS_NOTIFICATION_FROM_ADDRESS_REF",
  "replyToAddressRef": "ICE_RINK_RENTALS_DEFAULT_REPLY_TO_ADDRESS_REF",
  "subjectPreview": "New ice rink quote request: Example...",
  "status": "dry-run",
  "providerMessageId": "",
  "errorCode": "",
  "errorMessageSafe": "",
  "createdAt": "2026-05-28T00:00:00Z",
  "sentAt": "",
  "failedAt": "",
  "retryCount": 0,
  "metadata": {
    "dryRunOnly": true,
    "source": "email-readiness-contract"
  }
}
```

## Fields

- `id`: unique log id.
- `tenantId`: tenant id.
- `siteKey`: site key.
- `providerKey`: selected provider key, or `pending-provider-decision` before setup.
- `templateKey`: template used.
- `messageType`: `lead-notification`, `autoresponder`, `system-alert`, or future safe value.
- `relatedEntityType`: source entity such as `FormEntry`.
- `relatedEntityId`: source entity id.
- `formEntryId`: FormEntry id when applicable.
- `recipientEmailHash`: preferred recipient storage when full email retention is not approved.
- `recipientEmailSummary`: masked recipient, mailbox ref, or role description.
- `recipientEmail`: optional and disabled by default. Only store if privacy policy approves.
- `fromAddressRef`: sender ref only.
- `replyToAddressRef`: reply-to ref only.
- `subjectPreview`: safe truncated subject preview.
- `status`: `queued`, `dry-run`, `sent`, `failed`, `suppressed`, or `blocked`.
- `providerMessageId`: provider id if one is returned after real sending.
- `errorCode`: provider or internal safe error code.
- `errorMessageSafe`: sanitized non-secret error message.
- `createdAt`, `sentAt`, `failedAt`: timestamps.
- `retryCount`: integer retry count.
- `metadata`: safe structured metadata only.

## Privacy Decision

Default posture: store `recipientEmailHash` and `recipientEmailSummary`, not full `recipientEmail`.

Full recipient email may be stored only after a privacy/retention decision because FormEntry already contains submitter contact data and Lead Inbox is the source of truth.

## Guardrails

- Do not log SMTP passwords.
- Do not log provider API tokens.
- Do not log OAuth secrets or app passwords.
- Do not log DKIM private keys.
- Do not log raw RFC 822 messages.
- Do not log full HTML/text payloads unless a future policy explicitly allows a sanitized preview.
- Sanitize provider errors before storage.

