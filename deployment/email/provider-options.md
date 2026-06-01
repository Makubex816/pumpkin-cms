# Email Provider Options And Contract

Pumpkin can support hosted mailbox providers, forwarding-only providers, self-hosted mail, SMTP relays, and legacy providers without hard-coding credentials or DNS values.

For IceSkatingRinkRentals.com, the selected provider is now Microsoft 365 Exchange Online Plan 1.

- Selected provider key: `microsoft-365-exchange-online-plan1`
- Selected provider status: `selected-not-configured`
- Provider type: `hosted-mailbox`
- Application email strategy: Microsoft 365-compatible, Graph/OAuth-ready first, SMTP AUTH fallback only if explicitly enabled later
- Ready for provider setup: yes
- Ready for real SMTP/Graph sending: no
- Ready for MX cutover: no
- Ready for production DNS changes: no

RollerRinkRentals.com remains paused.

The canonical placeholder-safe comparison presets live in `provider-presets.template.json`. The selected Microsoft 365 profile lives in `provider-microsoft-365-exchange-online-plan1.template.json`.

## Provider Configuration Contract

Each provider profile supports:

- `providerKey`: stable lowercase key such as `microsoft-365-exchange-online-plan1`, `purelymail`, `cloudflare-email-routing`, or `custom`.
- `providerType`: `hosted-mailbox`, `forwarding-only`, `self-hosted-mail`, `smtp-relay`, or `legacy-provider`.
- `displayName`: human-readable provider label.
- `status`: `candidate`, `selected`, `selected-not-configured`, `configured`, `blocked`, or `retired`.
- `supportedCapabilities`: subset of `mailboxHosting`, `aliases`, `forwarding`, `imap`, `smtpSubmission`, `graphSendMail`, `webmail`, `outboundRelay`, `inboundRouting`, `dkim`, `dmarc`, `spf`, `migration`, and `catchAll`.
- `capabilities`: optional provider-specific capability detail map.
- `configRefs`: object of non-secret refs only.
- `requiredDnsRecords`: checklist records by `recordRef`, `type`, and `status`.
- `requiredSecretsRefs`: names of secrets that must be stored outside the repo if this provider is selected.
- `notes`: safe implementation notes.
- `decisionStatus`: why this provider is present in the comparison.
- `blockerNotes`: known blockers or capability gaps.

Never store real SMTP host credentials, mailbox passwords, provider API tokens, Microsoft tenant secrets, OAuth client secrets, app passwords, refresh tokens, access tokens, DKIM private keys, recovery codes, or DNS secrets in a provider profile.

## Selected Provider For Ice

| Provider key | Type | Status | Main fit | Important note |
| --- | --- | --- | --- | --- |
| `microsoft-365-exchange-online-plan1` | hosted-mailbox | selected-not-configured | Hosted Exchange mailbox, Outlook/webmail, aliases, inbound routing, SPF/DKIM/DMARC, Microsoft Graph SendMail path | Per-user mailbox licensing. Not configured. No DNS, users, mailboxes, aliases, credentials, or test sends are created in this phase. |

Microsoft Graph/OAuth is the preferred future application email path for Pumpkin notifications and autoresponders. SMTP AUTH is an optional fallback only if explicitly verified and enabled later.

## Reference Alternatives

These providers remain reference alternatives only and are not the selected Ice launch path:

| Provider key | Type | Main fit | Important blocker or note |
| --- | --- | --- | --- |
| `purelymail` | hosted-mailbox | Low-cost mailbox hosting with SMTP/IMAP style capability | Low-cost alternative only. DNS and credentials must come from provider docs/account later. |
| `cloudflare-email-routing` | forwarding-only | Inbound aliases/forwarding | Forwarding-only. It is not a full mailbox and does not provide outbound SMTP by itself. |
| `migadu` | hosted-mailbox | Hosted domain mail with mailbox/alias controls | Low-cost alternative only. Exact limits and DNS must be reviewed later. |
| `mxroute` | hosted-mailbox | Hosted mailbox and outbound mail candidate | Low-cost alternative only. Use selected server panel values later. |
| `google-workspace` | hosted-mailbox | Full hosted business mail | Reference alternative. OAuth/app-password strategy would need separate approval. |
| `bluehost-legacy` | legacy-provider | Preservation or migration reference | Bluehost can remain active for other domains until intentionally migrated. Do not modify Bluehost in this phase. |
| `mailcow` | self-hosted-mail | Full self-hosted stack | Future advanced option only. Requires server operations, PTR, monitoring, backups, abuse handling, and deliverability ownership. |
| `mail-in-a-box` | self-hosted-mail | Opinionated self-hosted mail | Future advanced option only. Requires operational ownership and reverse DNS. |
| `mailu` | self-hosted-mail | Self-hosted Docker mail stack | Future advanced option only. Requires deliverability and infrastructure ownership. |
| `modoboa` | self-hosted-mail | Self-hosted mail/admin stack | Future advanced option only. Requires server, DNS, and maintenance ownership. |
| `stalwart` | self-hosted-mail | Modern self-hosted mail/JMAP path | Future advanced option only. Requires hosting, PTR, TLS, monitoring, and approval. |
| `custom` | smtp-relay | Fallback for an unlisted provider or relay | Must be reviewed against provider docs before enabling. |

## Decision Rules

- Pumpkin may track many `candidate` profiles at once.
- Ice has one selected provider: `microsoft-365-exchange-online-plan1`.
- `selected-not-configured` means the provider is chosen, but account setup, domain verification, mailbox creation, DNS, secure runtime secrets, and tests are not complete.
- `configured` means DNS, secure secrets, Graph/SMTP setup, mailbox manifest, and tests have been completed outside the repo.
- `blocked` means the provider cannot satisfy the required launch capability without another service.
- `retired` means the option is no longer under consideration.

## Placeholder Ref Rules

Good:

```json
{
  "providerKey": "microsoft-365-exchange-online-plan1",
  "clientSecretRef": "MICROSOFT_365_CLIENT_SECRET_REF",
  "smtpPasswordRef": "MICROSOFT_365_SMTP_PASSWORD_REF"
}
```

Bad:

```json
{
  "clientSecret": "literal-secret",
  "smtpPassword": "literal-password",
  "providerToken": "literal-token"
}
```

Refs identify where a value will be supplied later by secure runtime configuration. They are not the values themselves.
