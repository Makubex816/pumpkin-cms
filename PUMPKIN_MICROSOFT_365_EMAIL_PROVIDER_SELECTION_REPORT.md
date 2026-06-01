# Pumpkin Microsoft 365 Email Provider Selection Report

## Scope

IceSkatingRinkRentals.com is the primary launch focus.

Microsoft 365 Exchange Online Plan 1 is selected for Ice domain email readiness, but it is not configured. This phase updates Pumpkin's email readiness layer only.

No Microsoft 365 tenant resources, users, mailboxes, aliases, DNS records, SMTP credentials, Graph credentials, CMS Page records, CMS Theme records, static packages, deployments, Azure resources, Cloudflare records, Bluehost records, or GitHub workflows were created or modified.

RollerRinkRentals.com remains paused.

## Git Status At Start

Required start checks were run from `C:\Users\User\Desktop\PumpkinCMS\pumpkin-cms`.

`git status --short` at start:

```text

```

The starting worktree was clean.

`git log --oneline -12` at start:

```text
3792044 Update Ice homepage media upload selection manifest
910971c Add email infrastructure readiness system
3526250 Add Ice import readiness input request package
bbf848f Add Ice homepage media upload selection manifest
52d4c9c Add Phase 8C.14B page intake normalizer
7b6c7fe Add Phase 8C.15 Ice homepage media binding manifest
cb3e6fb Add Phase 8C.14 Ice homepage media intake validation
9c8fc83 Add Phase 8C.13 Ice final approval resolution package
96eea2d Add Phase 8C.12 Ice final import prep package
bdf073a Add Phase 8C.11C .NET page contract alignment
337abbe Add Phase 8C.11B Tailwind and navigation hardening
```

## Files Changed

- `deployment/email/README.md`
- `deployment/email/provider-options.md`
- `deployment/email/provider-presets.template.json`
- `deployment/email/provider-microsoft-365-exchange-online-plan1.template.json`
- `deployment/email/microsoft-365-exchange-online-plan1.md`
- `deployment/email/ice-domain-email-settings.template.json`
- `deployment/email/ice-domain-email-settings.microsoft365.template.json`
- `deployment/email/mailbox-alias-manifest.ice.microsoft365.template.json`
- `deployment/email/microsoft-365-dns-readiness-checklist.md`
- `deployment/email/microsoft-365-app-sending-config.template.json`
- `deployment/email/smtp-submission-config.template.json`
- `deployment/email/lead-notification-template.ice.json`
- `deployment/email/autoresponder-template.ice.json`
- `deployment/email/outbound-email-log-contract.md`
- `deployment/email/inbound-routing-notes.md`
- `deployment/email/bluehost-migration-checklist.md`
- `deployment/email/no-secret-email-guardrails.md`
- `deployment/email/fixtures/email-readiness-cases.json`
- `deployment/email/validate-email-readiness-fixtures.mjs`
- `PUMPKIN_MICROSOFT_365_EMAIL_PROVIDER_SELECTION_REPORT.md`

## Provider Selected

- Provider key: `microsoft-365-exchange-online-plan1`
- Display name: Microsoft 365 Exchange Online Plan 1
- Provider type: `hosted-mailbox`
- Status: `selected-not-configured`
- Application email strategy: Microsoft 365-compatible, Graph/OAuth-ready first, SMTP AUTH fallback only if explicitly enabled later

## Why Microsoft 365 Fits Ice

Microsoft 365 Exchange Online Plan 1 fits Ice because it is hosted mailbox infrastructure with Exchange/Outlook access, alias support, inbound routing, SPF/DKIM/DMARC support, and a Microsoft Graph SendMail path for future Pumpkin application email.

The cost model is per-user mailbox licensing, not free forwarding and not self-hosted operations. Current pricing must be confirmed directly before purchase; this report does not assert a live price.

## Mailbox And Alias Proposal

Primary licensed mailbox candidate:

- `contact@iceskatingrinkrentals.com`

Aliases or secondary addresses to evaluate:

- `quotes@iceskatingrinkrentals.com`
- `admin@iceskatingrinkrentals.com`
- `no-reply@iceskatingrinkrentals.com`

Nothing is marked created. The Microsoft 365 mailbox manifest uses `proposed`, `pending-provider-setup`, and `not-created` status fields.

Public email display remains undecided. Alias outbound behavior and no-reply behavior must be verified before production.

## Lead Inbox And Application Email

Pumpkin Lead Inbox remains the source of truth for contact and quote form submissions.

Email notifications and autoresponders are secondary delivery only. They remain disabled and dry-run-only until Microsoft 365 setup, DNS authentication, secure runtime refs, dry-run validation, and explicit sending approval are complete.

## Graph/OAuth Preferred Path

`microsoft-365-app-sending-config.template.json` prepares Microsoft Graph SendMail as the preferred future path using refs only:

- `MICROSOFT_365_GRAPH_SEND_ENABLED_REF`
- `MICROSOFT_365_TENANT_ID_REF`
- `MICROSOFT_365_CLIENT_ID_REF`
- `MICROSOFT_365_CLIENT_SECRET_REF`
- `MICROSOFT_365_FROM_ADDRESS_REF`
- `MICROSOFT_365_REPLY_TO_ADDRESS_REF`

The required Microsoft Graph permission, such as `Mail.Send`, must be confirmed during Microsoft 365 app setup and least-privilege review.

## SMTP AUTH Fallback Caveat

SMTP AUTH is documented only as a fallback. It remains disabled and dry-run-only in repo templates.

SMTP AUTH must be explicitly verified and enabled later before use. No SMTP host, username, password, app password, or mailbox password value is committed.

## DNS Readiness

The Microsoft 365 DNS checklist covers:

- domain verification TXT placeholder
- MX placeholder from Microsoft 365 admin center
- SPF placeholder including `include:spf.protection.outlook.com`
- DKIM selector/CNAME placeholders from Microsoft 365 admin center
- DMARC monitoring-first policy planning
- Autodiscover placeholder
- TTL and cutover timing
- Bluehost and other-domain preservation

No DNS record was created or changed. Ready for MX cutover: no. Ready for production DNS changes: no.

## Bluehost And Other Domains

Ice currently has no known configured domain email, so it should not require legacy mailbox migration unless existing mailboxes are later found.

Other managed domains may continue using Bluehost or another provider. This phase does not modify those domains and does not change their MX records. Any future domain migration must inventory mailboxes, aliases, forwards, catch-all behavior, DNS, and retention needs before cutover.

## No-Secret Guardrails

Guardrails now include Microsoft-specific forbidden values:

- Microsoft 365 client secrets
- tenant secrets
- access tokens
- refresh tokens
- SMTP passwords
- app passwords
- certificate private keys
- DKIM private keys
- OAuth secret strings

Committed files use placeholder refs only.

## Validators And Fixtures

The email readiness fixture validator now covers:

- valid Microsoft 365 provider config
- invalid Microsoft 365 provider config with literal client secret blocked
- valid Ice Microsoft 365 domain settings
- valid Microsoft 365 mailbox manifest
- valid Microsoft 365 app sending config with refs only
- invalid Microsoft 365 app sending config with literal client secret blocked
- invalid SMTP config with literal password blocked
- valid selected-provider notification template
- valid selected-provider autoresponder template
- Microsoft 365 DNS checklist required sections
- provider decision status `selected-not-configured`

## Checks Run

- `git status --short` at start: clean.
- `git log --oneline -12` at start: captured above.
- `node deployment/email/validate-email-readiness-fixtures.mjs`: passed with 21 fixture checks.
- JSON parse validation for created/updated JSON templates: passed.
- `node --check deployment/email/validate-email-readiness-fixtures.mjs`: passed.
- `git diff --check`: passed with Git line-ending normalization warnings only.
- Direct trailing whitespace scan: passed across 20 changed report/email files.
- Protected config/workflow/generated-folder check: passed. No `.env.local`, `appsettings.Development.json`, `.github/workflows`, `.next`, `node_modules`, generated static folder, ZIP, or raw media path is in the changed file set.
- Targeted secret scan: passed across 23 email/report files. Two synthetic invalid fixture canaries were detected and allowed only because the validator uses them to prove bad values are blocked.
- No generated static folders staged: passed.
- No ZIPs staged: passed.
- No raw media files staged: passed.
- No protected config modified: passed.
- No files staged: passed.

## Known Limitations

- No Microsoft 365 account has been purchased or configured.
- No domain verification has been performed.
- No users, mailboxes, aliases, forwards, or groups have been created.
- No DNS records have been created or changed.
- No Microsoft Graph app registration exists from this phase.
- No real Graph/OAuth or SMTP credentials are configured.
- No real email is sent.
- No outbound email persistence model is implemented beyond the documented contract.
- No inbound Graph/webhook/IMAP ingestion is built.
- No admin Email Readiness UI is added.

## Remaining Before Real Email

- Buy/configure Exchange Online Plan 1.
- Verify the Ice domain in Microsoft 365.
- Create approved mailbox and aliases.
- Configure DNS from Microsoft 365 admin center values.
- Verify SPF, DKIM, and DMARC.
- Decide public email display policy.
- Configure placeholder refs with real secrets outside repo.
- Register/approve Microsoft Graph app access or explicitly enable SMTP AUTH fallback.
- Run dry-run validation.
- Run controlled test sending only after approval.

## Decision State

- Ready for provider setup: yes
- Ready for real SMTP/Graph sending: no
- Ready for MX cutover: no
- Ready for production DNS changes: no

## References

- Microsoft 365 custom domain setup: https://learn.microsoft.com/en-us/microsoft-365/admin/setup/add-domain
- Microsoft 365 DNS records: https://learn.microsoft.com/en-us/microsoft-365/admin/get-help-with-domains/create-dns-records-at-any-dns-hosting-provider
- Microsoft 365 SPF guidance: https://learn.microsoft.com/en-us/microsoft-365/security/office-365-security/how-office-365-uses-spf-to-prevent-spoofing
- Microsoft 365 DKIM guidance: https://learn.microsoft.com/en-us/microsoft-365/security/office-365-security/email-authentication-dkim-configure
- Microsoft Graph SendMail: https://learn.microsoft.com/en-us/graph/api/user-sendmail
- Microsoft Graph permissions reference: https://learn.microsoft.com/en-us/graph/permissions-reference
