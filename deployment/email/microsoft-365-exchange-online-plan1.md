# Microsoft 365 Exchange Online Plan 1 Selection

## Selected Provider

Microsoft 365 Exchange Online Plan 1 is the selected email provider for IceSkatingRinkRentals.com.

- Provider key: `microsoft-365-exchange-online-plan1`
- Provider category: `hosted-mailbox`
- Status: `selected-not-configured`
- Ready for provider setup: yes
- Ready for real SMTP/Graph sending: no
- Ready for MX cutover: no
- Ready for production DNS changes: no

RollerRinkRentals.com remains paused.

## Why Selected

Microsoft 365 Exchange Online Plan 1 fits the Ice launch path because it provides hosted domain mailbox capability, Exchange/Outlook access, mailbox/alias administration, inbound routing, SPF/DKIM/DMARC support, and a Microsoft Graph/OAuth application email path that can be prepared without storing credentials in the repo.

This is not a free or self-hosted option. The cost model is per-user mailbox licensing, with aliases and sending identities subject to Microsoft 365 and Exchange Online configuration rules. Current pricing should be confirmed directly before purchase; this readiness layer does not assert a live price.

## Initial Ice Setup Proposal

Primary licensed mailbox candidate:

- `contact@iceskatingrinkrentals.com`

Aliases or secondary addresses to evaluate:

- `quotes@iceskatingrinkrentals.com`
- `admin@iceskatingrinkrentals.com`
- `no-reply@iceskatingrinkrentals.com`

No mailbox, alias, user, group, or sending identity has been created by this repo.

## Alias And Sending Caveats

Aliases do not always behave like independent sending identities unless the mailbox, Exchange settings, and send-as/send-on-behalf policy are configured and approved. Treat every alias as inbound-only until outbound behavior is verified.

`no-reply@iceskatingrinkrentals.com` must be verified before production use. The launch default should prefer a monitored reply-to address unless a no-reply policy is explicitly approved.

## Pumpkin Source Of Truth

Pumpkin Lead Inbox remains the source of truth for quote requests and contact form submissions.

Email notifications and autoresponders are secondary delivery mechanisms. A missing, delayed, bounced, or suppressed email must not cause Pumpkin to lose the lead record.

## Application Email Strategy

Preferred future path:

- Microsoft Graph SendMail with OAuth-style application or delegated authorization.
- Placeholder refs only for tenant id, client id, client secret, from address, reply-to address, and Graph enablement.
- Required permission such as `Mail.Send` must be confirmed during Microsoft 365 app registration and least-privilege review.

Optional fallback:

- SMTP AUTH submission only if it is explicitly enabled and verified later.
- Placeholder refs only for host, port, username, password, secure mode, and SMTP AUTH enablement.

No real SMTP credentials, OAuth secrets, refresh tokens, access tokens, Microsoft tenant secrets, DKIM private keys, or DNS secrets belong in this repo.

## DNS Status

Microsoft 365 is selected but not configured.

- No Microsoft domain verification record has been created.
- No MX record has been changed.
- No SPF record has been changed.
- No DKIM CNAME record has been created.
- No DMARC record has been changed.
- No DNS cutover has occurred.

DNS values must come from the Microsoft 365 admin center during setup. Ice currently has no configured domain email, so cutover should be simpler than a mailbox migration, but other managed domains may still have Bluehost or other existing mail and must not be changed in this phase.

## References

- Microsoft 365 custom domain and DNS setup: https://learn.microsoft.com/en-us/microsoft-365/admin/setup/add-domain
- Microsoft 365 DNS records: https://learn.microsoft.com/en-us/microsoft-365/admin/get-help-with-domains/create-dns-records-at-any-dns-hosting-provider
- Microsoft 365 SPF guidance: https://learn.microsoft.com/en-us/microsoft-365/security/office-365-security/how-office-365-uses-spf-to-prevent-spoofing
- Microsoft 365 DKIM guidance: https://learn.microsoft.com/en-us/microsoft-365/security/office-365-security/email-authentication-dkim-configure
- Microsoft Graph SendMail: https://learn.microsoft.com/en-us/graph/api/user-sendmail
- Microsoft Graph permissions reference: https://learn.microsoft.com/en-us/graph/permissions-reference
