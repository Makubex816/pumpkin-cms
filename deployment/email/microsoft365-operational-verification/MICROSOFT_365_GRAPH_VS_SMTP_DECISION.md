# Microsoft 365 Graph Vs SMTP Decision

This file compares Microsoft Graph SendMail and SMTP AUTH for future Pumpkin lead notifications/autoresponders.

## Recommended Default

Prefer Microsoft Graph or another Microsoft 365-approved modern auth path where practical.

Keep SMTP AUTH disabled unless explicitly approved and tenant policy supports it.

Do not rely on password SMTP as the only long-term strategy.

## Microsoft Graph SendMail

Potential fit:

- Modern OAuth-based Microsoft integration path.
- Better alignment with future app permissions and auditability.
- Avoids relying on mailbox password SMTP as the primary strategy.

Required later:

- Microsoft app registration or approved equivalent.
- Least-privilege permission review, such as `Mail.Send` where appropriate.
- Secure runtime configuration outside repo.
- Dry-run and controlled staging test.
- Outbound email logging.

Placeholder refs only:

- `MICROSOFT_365_TENANT_ID_REF`
- `MICROSOFT_365_CLIENT_ID_REF`
- `MICROSOFT_365_CLIENT_SECRET_REF`
- `MICROSOFT_365_FROM_ADDRESS_REF`
- `MICROSOFT_365_REPLY_TO_ADDRESS_REF`
- `MICROSOFT_365_GRAPH_SEND_ENABLED_REF`

## SMTP AUTH

Potential fit:

- Familiar SMTP submission model.
- May be simpler if Microsoft tenant policy explicitly permits it.

Risks and caveats:

- SMTP AUTH may be disabled or restricted by tenant policy.
- Password/app-password management can increase operational risk.
- It should not be assumed as the only long-term strategy.

Placeholder refs only:

- `MICROSOFT_365_SMTP_AUTH_ENABLED_REF`
- `MICROSOFT_365_SMTP_HOST_REF`
- `MICROSOFT_365_SMTP_PORT_REF`
- `MICROSOFT_365_SMTP_USERNAME_REF`
- `MICROSOFT_365_SMTP_PASSWORD_REF`

## Current Decision

- Preferred future path: Microsoft Graph/modern auth where practical.
- SMTP AUTH: optional fallback, disabled unless explicitly approved.
- Pumpkin sending status: dry-run only.

No credentials or tokens belong in this repo.
