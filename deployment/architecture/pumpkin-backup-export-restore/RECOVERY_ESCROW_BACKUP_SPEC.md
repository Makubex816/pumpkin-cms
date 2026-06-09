# Recovery Escrow Backup Spec

## Escrow Folder Shape

```text
escrow/
  escrow-manifest.json
  encrypted-secrets.<format>
  recipient-public-keys.json
  escrow-approval-record.json
  escrow-checksums.sha256
  ESCROW_RESTORE_INSTRUCTIONS.md
```

## Design Rules

- Escrow is separate from normal backup content.
- Escrow payloads are encrypted before storage or download.
- Escrow requires elevated role, reason, and approval.
- Escrow uses allowlisted secret categories only.
- Escrow excludes short-lived JWT/session/cookie material by default.
- Escrow restore requires separate approval.
- Escrow export, download, validation, and restore attempts are audit logged.
- Escrow is never included in normal support packets.
- Escrow payloads must never be created in public/static directories.

## Escrow-Eligible Categories With Approval

- Tenant API keys.
- Service API keys.
- Cloudflare API tokens.
- Azure deployment tokens.
- Azure storage connection strings.
- Function App secret values.
- Microsoft Graph app credentials.
- SMTP credentials if ever used.
- Third-party integration credentials.

## Excluded By Default

- `PUMPKIN_ADMIN_JWT`.
- Browser session cookies.
- Auth headers.
- Temporary SAS URLs.
- One-time tokens.
- Local machine paths.
- Personal operator credentials.
- Private customer data.

## Recovery Posture

Escrow backup is for recoverability, not convenience. It should be rarer than standard backup, shorter-lived, more tightly permissioned, and auditable end to end.
