# Outbound Email Log Contract

`OutboundEmailLog` records Pumpkin application email attempts without storing secrets or full raw payloads.

This model is a contract for future implementation. No database container is created in this phase.

## Shape

```json
{
  "id": "email-log-id",
  "tenantId": "ice-rink-rentals",
  "siteKey": "ice-rink-rentals",
  "providerKey": "microsoft-365-exchange-online-plan1",
  "templateKey": "ice-lead-notification-default",
  "messageType": "lead-notification",
  "relatedEntityType": "FormEntry",
  "relatedEntityId": "form-entry-id",
  "formEntryId": "form-entry-id",
  "recipientEmailHash": "sha256-or-provider-safe-hash",
  "recipientEmailSummary": "admin mailbox ref or masked recipient",
  "recipientEmail": "",
  "fromAddressRef": "MICROSOFT_365_NOTIFICATION_FROM_ADDRESS_REF",
  "replyToAddressRef": "MICROSOFT_365_REPLY_TO_ADDRESS_REF",
  "subjectPreview": "New ice rink quote request: Example...",
  "status": "dry-run",
  "providerMessageId": "",
  "graphMessageId": "",
  "errorCode": "",
  "errorMessageSafe": "",
  "createdAt": "2026-06-01T00:00:00Z",
  "sentAt": "",
  "failedAt": "",
  "retryCount": 0,
  "metadata": {
    "dryRunOnly": true,
    "source": "email-readiness-contract",
    "appSendingStrategy": "graph-preferred"
  }
}
```

## Fields

- `id`: unique log id.
- `tenantId`: tenant id.
- `siteKey`: site key.
- `providerKey`: selected provider key. For Ice this is `microsoft-365-exchange-online-plan1`.
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
- `graphMessageId`: Microsoft Graph message id or safe Graph message reference when available after real sending.
- `errorCode`: provider or internal safe error code.
- `errorMessageSafe`: sanitized non-secret error message.
- `createdAt`, `sentAt`, `failedAt`: timestamps.
- `retryCount`: integer retry count.
- `metadata`: safe structured metadata only.

## Microsoft 365 Compatibility

For Microsoft 365 Exchange Online Plan 1:

- Graph SendMail is the preferred future app-sending path.
- SMTP AUTH fallback, if ever enabled, still uses the same safe status and error fields.
- `graphMessageId` or `providerMessageId` may be recorded only after real sending is approved.
- Safe provider metadata can record `graph`, `smtp-auth-fallback`, or `dry-run` strategy values.
- Raw Graph request/response payloads must not be logged by default.

## Privacy Decision

Default posture: store `recipientEmailHash` and `recipientEmailSummary`, not full `recipientEmail`.

Full recipient email may be stored only after a privacy/retention decision because FormEntry already contains submitter contact data and Lead Inbox is the source of truth.

## Guardrails

- Do not log SMTP passwords.
- Do not log provider API tokens.
- Do not log Microsoft tenant secrets.
- Do not log Microsoft Graph access tokens or refresh tokens.
- Do not log OAuth client secrets or app passwords.
- Do not log certificate private keys.
- Do not log DKIM private keys.
- Do not log raw RFC 822 messages.
- Do not log full HTML/text payloads unless a future policy explicitly allows a sanitized preview.
- Sanitize provider errors before storage.
