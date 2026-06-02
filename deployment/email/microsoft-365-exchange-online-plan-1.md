# Microsoft 365 Exchange Online Plan 1 Setup State

## Selected Provider

Microsoft 365 Exchange Online Plan 1 is the selected email provider for IceSkatingRinkRentals.com.

- Provider key: `microsoft-365-exchange-online-plan-1`
- Provider category: `hosted-mailbox`
- Provider status: `selected`
- Setup status: partially set up outside code
- DNS host: Bluehost
- Ready for provider decision: yes
- Domain verification TXT added: yes
- Ready for real SMTP/Graph sending: no
- Ready for MX cutover: no
- Ready for production DNS changes: no

RollerRinkRentals.com remains paused.

## Real-World Setup State

- Microsoft 365 Exchange Online Plan 1 has been purchased.
- The selected mailbox/user is `contact@iceskatingrinkrentals.com`.
- Microsoft 365 domain verification is in progress or completed through Bluehost DNS.
- The DNS host is Bluehost.
- IceSkatingRinkRentals.com did not previously have an email setup, so no known Ice mailbox migration is required.
- Other user-managed domains may still have Bluehost email and must not be changed in this work.

## Verification TXT Record

The Microsoft 365 domain verification TXT record was added at Bluehost outside code:

| Field | Value |
| --- | --- |
| Host/Name | `@` |
| TXT value | `MS=ms13281863` |
| TTL | `3600 / Bluehost 4 Hours` |
| Status | `added-at-bluehost` |

This TXT value is safe to document because it is not a password, token, secret, credential, recovery code, DKIM private key, or connection string.

No DNS record is created, edited, deleted, or verified by this repo.

## Initial Ice Mailbox Proposal

Primary licensed mailbox/user:

- `contact@iceskatingrinkrentals.com`

Aliases or secondary addresses still pending Microsoft 365 admin setup:

- `quotes@iceskatingrinkrentals.com`
- `admin@iceskatingrinkrentals.com`
- `no-reply@iceskatingrinkrentals.com`

Alias outbound behavior and no-reply behavior must be verified before production. Form-first remains recommended, public email display remains under review, and this provider setup should not force email addresses into public website content.

## Pumpkin Source Of Truth

Pumpkin Lead Inbox remains the source of truth for quote requests and contact form submissions.

Email notifications and autoresponders are secondary delivery mechanisms. A missing, delayed, bounced, or suppressed email must not cause Pumpkin to lose the lead record.

## Application Email Strategy

Preferred future path:

- Microsoft 365-approved modern send integration where practical.
- Microsoft Graph SendMail/OAuth-style integration remains the preferred Pumpkin application email path.
- Placeholder refs only for tenant id, client id, client secret, from address, reply-to address, and Graph enablement.
- Required permission such as `Mail.Send` must be confirmed during Microsoft 365 app registration and least-privilege review.

Optional fallback:

- SMTP AUTH submission only if it is explicitly enabled and verified later.
- Placeholder refs only for host, port, username, password, secure mode, and SMTP AUTH enablement.

No real SMTP credentials, OAuth secrets, refresh tokens, access tokens, Microsoft tenant secrets, DKIM private keys, DNS secrets, app passwords, or recovery codes belong in this repo.

## DNS Status

Already added outside code:

- Microsoft 365 verification TXT: `@ TXT MS=ms13281863`

Still required before receiving or sending production mail:

- Microsoft 365 MX record from admin center
- SPF TXT authorizing Microsoft 365
- DKIM records/selectors from Microsoft 365 admin center
- DMARC TXT
- Autodiscover CNAME if required
- inbound and outbound test plan

No MX cutover has occurred. No production DNS change is ready.
