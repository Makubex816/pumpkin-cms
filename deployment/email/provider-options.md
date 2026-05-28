# Email Provider Options And Contract

Pumpkin should be able to support hosted mailbox providers, forwarding-only providers, self-hosted mail, SMTP relays, and legacy providers without hard-coding the final provider decision.

The canonical placeholder-safe presets live in `provider-presets.template.json`.

## Provider Configuration Contract

Each provider profile supports:

- `providerKey`: stable lowercase key such as `purelymail`, `cloudflare-email-routing`, or `custom`.
- `providerType`: `hosted-mailbox`, `forwarding-only`, `self-hosted-mail`, `smtp-relay`, or `legacy-provider`.
- `displayName`: human-readable provider label.
- `status`: `candidate`, `selected`, `configured`, `blocked`, or `retired`.
- `supportedCapabilities`: subset of `mailboxHosting`, `aliases`, `forwarding`, `imap`, `smtpSubmission`, `webmail`, `outboundRelay`, `inboundRouting`, `dkim`, `dmarc`, `spf`, `migration`, and `catchAll`.
- `configRefs`: object of non-secret refs only.
- `requiredDnsRecords`: checklist records by `recordRef`, `type`, and `status`.
- `requiredSecretsRefs`: names of secrets that must be stored outside the repo if this provider is selected.
- `notes`: safe implementation notes.
- `decisionStatus`: why this provider is present in the comparison.
- `blockerNotes`: known blockers or capability gaps.

Never store real SMTP host credentials, mailbox passwords, provider API tokens, OAuth secrets, app passwords, DKIM private keys, or recovery codes in a provider profile.

## Candidate Profiles

| Provider key | Type | Main fit | Important blocker or note |
| --- | --- | --- | --- |
| `purelymail` | hosted-mailbox | Low-cost mailbox hosting with SMTP/IMAP style capability | Candidate only. DNS and credentials must come from provider docs/account later. |
| `cloudflare-email-routing` | forwarding-only | Inbound aliases/forwarding | Not mailbox hosting and not outbound SMTP by itself. |
| `migadu` | hosted-mailbox | Hosted domain mail with mailbox/alias controls | Candidate only. Exact limits and DNS must be reviewed later. |
| `mxroute` | hosted-mailbox | Hosted mailbox and outbound mail candidate | Candidate only. Use selected server panel values later. |
| `google-workspace` | hosted-mailbox | Full hosted business mail | Higher-cost candidate. OAuth/app-password strategy must be approved. |
| `bluehost-legacy` | legacy-provider | Preservation or migration reference | Do not modify Bluehost until final cutover plan exists. |
| `mailcow` | self-hosted-mail | Full self-hosted stack | Requires server operations, PTR, monitoring, backups, and abuse handling. |
| `mail-in-a-box` | self-hosted-mail | Opinionated self-hosted mail | Requires operational ownership and reverse DNS. |
| `mailu` | self-hosted-mail | Self-hosted Docker mail stack | Requires deliverability and infrastructure ownership. |
| `modoboa` | self-hosted-mail | Self-hosted mail/admin stack | Requires server, DNS, and maintenance ownership. |
| `stalwart` | self-hosted-mail | Modern self-hosted mail/JMAP path | Requires hosting, PTR, TLS, monitoring, and approval. |
| `custom` | smtp-relay | Fallback for an unlisted provider or relay | Must be reviewed against provider docs before enabling. |

## Decision Rules

- Pumpkin may track many `candidate` profiles at once.
- Only one provider should become `selected` for a domain before real setup.
- `configured` means DNS, secure secrets, SMTP, mailbox manifest, and tests have been completed outside the repo.
- `blocked` means the provider cannot satisfy the required launch capability without another service.
- `retired` means the option is no longer under consideration.

## Placeholder Ref Rules

Good:

```json
{
  "smtpProfileRef": "ICE_RINK_RENTALS_SMTP_PROFILE_REF",
  "requiredSecretsRefs": ["ICE_RINK_RENTALS_SMTP_PASSWORD_REF"]
}
```

Bad:

```json
{
  "smtpPassword": "literal-password",
  "providerToken": "literal-token"
}
```

Refs identify where a value will be supplied later by secure runtime configuration. They are not the values themselves.

