# Pumpkin Email Provider Selection Microsoft 365 Report

## Scope

IceSkatingRinkRentals.com is the primary launch focus.

This update aligns Pumpkin's email readiness package with the real-world Microsoft 365 setup state provided by the user. Microsoft 365 Exchange Online Plan 1 has been purchased, `contact@iceskatingrinkrentals.com` is the selected mailbox/user, and the Microsoft 365 TXT verification record has been added at Bluehost outside code.

No DNS records were changed by code. No Microsoft 365 users, mailboxes, aliases, credentials, app registrations, SMTP settings, Graph credentials, CMS records, static packages, deployments, Azure resources, Cloudflare records, Bluehost records, ZIPs, raw media, or protected config were created or modified by code.

RollerRinkRentals.com remains paused.

## Git Status At Start

Required start checks were run from `C:\Users\User\Desktop\PumpkinCMS\pumpkin-cms`.

`git status --short` at start:

```text

```

The starting worktree was clean.

`git log --oneline -12` at start:

```text
218f4ca Select Microsoft 365 Exchange Online for Ice email readiness
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

## Selected Provider

- Provider key: `microsoft-365-exchange-online-plan-1`
- Display name: Microsoft 365 Exchange Online Plan 1
- Provider type: `hosted-mailbox`
- Provider status: `selected`
- Preset status: `selected-for-ice`
- DNS host: Bluehost
- Primary mailbox/user: `contact@iceskatingrinkrentals.com`

## Real-World Setup State

- Microsoft 365 Exchange Online Plan 1 has been purchased.
- The selected mailbox/user is `contact@iceskatingrinkrentals.com`.
- Microsoft 365 domain verification is in progress or completed through Bluehost DNS.
- IceSkatingRinkRentals.com had no known prior email setup, so no Ice mailbox migration is currently required.
- Other user-managed domains may still have Bluehost email and were not changed.

## TXT Verification Record Documented

The Microsoft 365 verification TXT record was documented as added at Bluehost:

| Field | Value |
| --- | --- |
| Host/Name | `@` |
| TXT value | `MS=ms13281863` |
| TTL | `3600 / Bluehost 4 Hours` |
| Status | `added-at-bluehost` |

This value is safe to document because it is not a credential. No passwords, tokens, recovery codes, DKIM private keys, OAuth secrets, app passwords, or connection strings were documented.

## Files Changed

- `deployment/email/README.md`
- `deployment/email/provider-options.md`
- `deployment/email/provider-presets.template.json`
- `deployment/email/provider-microsoft-365-exchange-online-plan-1.template.json`
- `deployment/email/provider-microsoft-365-exchange-online-plan1.template.json` removed in favor of the `plan-1` key naming
- `deployment/email/microsoft-365-exchange-online-plan-1.md`
- `deployment/email/microsoft-365-exchange-online-plan1.md` removed in favor of the `plan-1` key naming
- `deployment/email/ice-domain-email-settings.template.json`
- `deployment/email/ice-domain-email-settings.microsoft365.template.json`
- `deployment/email/mailbox-alias-manifest.ice.microsoft365.template.json`
- `deployment/email/microsoft-365-dns-readiness-checklist.md`
- `deployment/email/spf-dkim-dmarc-checklist.md`
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
- `PUMPKIN_EMAIL_PROVIDER_SELECTION_MICROSOFT365_REPORT.md`

## Ice Domain Email Settings Updated

Ice settings now record:

- provider key `microsoft-365-exchange-online-plan-1`
- provider type `hosted-mailbox`
- provider status `selected`
- DNS host `Bluehost`
- domain verification status `txt-record-added`
- mailbox setup status `in-progress`
- primary mailbox `contact@iceskatingrinkrentals.com`
- real SMTP sending status `not-ready`
- MX cutover status `not-ready`
- production DNS status `not-ready`

## Provider Preset Updated

The Microsoft 365 provider preset now records:

- status `selected-for-ice`
- verification TXT `@ TXT MS=ms13281863` as added at Bluehost
- SMTP submission as subject to Microsoft tenant policy
- outbound relay through an approved Microsoft send path
- required DNS records for verification TXT, MX, SPF, DKIM, DMARC, and Autodiscover if required
- refs only for tenant id, client id, client secret, from/reply-to addresses, Graph send enablement, SMTP AUTH enablement, SMTP host, port, username, and password

No real credential values are stored.

## Mailbox And Alias Manifest Updated

The Microsoft 365 Ice manifest now records:

- `contact@iceskatingrinkrentals.com` as the primary licensed mailbox/user, setup status `in-progress`
- `quotes@iceskatingrinkrentals.com` as a proposed alias pending Microsoft 365 admin setup
- `admin@iceskatingrinkrentals.com` as a proposed alias or separate mailbox candidate pending setup
- `no-reply@iceskatingrinkrentals.com` as a proposed alias or sending identity candidate pending setup

Public email display remains under review. Form-first remains recommended, and email provider setup does not automatically mean public email should be shown on the website.

## DNS Readiness Checklist Updated

The Microsoft 365 DNS checklist now distinguishes:

Already added outside code:

- verification TXT: `@ TXT MS=ms13281863`

Still required before receiving mail:

- Microsoft 365 MX record from admin center
- SPF TXT
- DKIM records/selectors
- DMARC TXT
- Autodiscover CNAME if required
- inbound and outbound tests

MX cutover is not ready. Production DNS changes are not ready.

## SPF/DKIM/DMARC Checklist Updated

The authentication checklist now records:

- SPF must authorize Microsoft 365 before production sending.
- DKIM should be enabled for `iceskatingrinkrentals.com` before production sending.
- DMARC should be published before production sending.
- DMARC policy should start carefully, with monitoring first unless stricter enforcement is approved.
- Inbound and outbound tests are required before MX cutover.
- Pumpkin notification sending must be tested separately from mailbox receiving.

## SMTP/Graph Placeholder Config Updated

The app sending and SMTP config templates now record:

- `EMAIL_PROVIDER_KEY` expected value `microsoft-365-exchange-online-plan-1`
- `EMAIL_SEND_MODE` expected value `dry-run`
- Microsoft Graph/OAuth-style sending as the preferred modern path where practical
- SMTP AUTH fallback as optional and not enabled by default
- all Microsoft 365 runtime values as refs only

Sending remains disabled and dry-run-only.

## Templates Updated

Lead notification template:

- provider key `microsoft-365-exchange-online-plan-1`
- status `draft`
- `enabled: false`
- `dryRunOnly: true`
- recipient ref `ICE_RINK_RENTALS_LEAD_RECIPIENT`
- from/reply-to refs using Microsoft 365 placeholder refs

Autoresponder template:

- provider key `microsoft-365-exchange-online-plan-1`
- status `draft`
- `enabled: false`
- `dryRunOnly: true`
- `consentRequired: true`
- from/reply-to refs using Microsoft 365 placeholder refs

No real email is sent.

## Migration Notes Updated

For Ice:

- no prior email setup is known
- no IMAP mailbox migration is required unless a mailbox is later discovered
- verification TXT was added at Bluehost
- Microsoft 365 setup can proceed without affecting website DNS until MX cutover
- MX cutover should happen only after Microsoft 365 domain setup and testing

For other user-managed domains:

- do not change Bluehost email yet
- preserve existing MX/SPF/DKIM/DMARC
- inventory mailboxes, aliases, and forwards before any future migration
- migrate separately later

## No-Secret Guardrails Updated

Guardrails include:

- Microsoft 365 credentials
- SMTP passwords
- OAuth secrets
- app passwords
- access tokens
- refresh tokens
- DKIM private keys
- recovery codes

They also explicitly note that `MS=ms13281863` is a public Microsoft verification TXT value, not a credential.

## Validator And Fixture Results

Validation run before this report was created:

- JSON parse validation for changed JSON templates: passed for 10 JSON files.
- `node deployment/email/validate-email-readiness-fixtures.mjs`: passed with 21 fixture checks.
- `node --check deployment/email/validate-email-readiness-fixtures.mjs`: passed.
- `git diff --check`: passed with Git line-ending normalization warnings only.
- Direct trailing whitespace scan: passed across 23 changed report/email files.
- Protected config/workflow/generated-folder check: passed. No `.env.local`, `appsettings.Development.json`, `.github/workflows`, `.next`, `node_modules`, generated static folder, ZIP, or raw media path is in the changed file set.
- Targeted secret scan: passed across 23 email/report files. Two synthetic invalid fixture canaries were detected and allowed only because the validator uses them to prove bad values are blocked.
- No generated static folders staged: passed.
- No ZIPs staged: passed.
- No raw media files staged: passed.
- No protected config modified: passed.
- No files staged: passed.
- TypeScript type-check: not run because no TypeScript files changed.
- `dotnet build`: not run because no .NET files changed.

## Known Limitations

- No live DNS lookup was performed.
- No Bluehost record was read or changed by code.
- No Microsoft 365 admin center action was performed by code.
- No MX cutover is ready.
- SPF, DKIM, DMARC, and Autodiscover are not complete in repo readiness.
- Microsoft Graph app registration and secure runtime refs are not configured.
- SMTP AUTH is not enabled.
- No real email sending has been tested.
- Public email display remains under review.

## Remaining Before Real SMTP/Graph Sending

- Complete Microsoft 365 domain setup.
- Confirm or create the selected mailbox/user in Microsoft 365 admin center.
- Decide public email display policy.
- Configure secure runtime refs outside repo.
- Register or approve Microsoft Graph send integration, or explicitly approve SMTP AUTH fallback.
- Configure SPF/DKIM/DMARC.
- Run dry-run validation.
- Run controlled real send tests only after approval.

## Remaining Before MX Cutover

- Confirm mailbox login and routing.
- Configure approved aliases.
- Obtain Microsoft 365 MX value from admin center.
- Configure SPF, DKIM, DMARC, and Autodiscover if required.
- Run inbound and outbound tests.
- Lower TTL only during an approved cutover window.
- Switch MX only after explicit approval.

## Remaining Before Production DNS Changes

- Confirm DNS record inventory at Bluehost.
- Preserve other domains' Bluehost email records.
- Verify all Microsoft 365 DNS values from admin center.
- Confirm rollback notes.
- Confirm monitoring and post-cutover test plan.

## Decision State

- Ready for provider decision: yes, provider selected
- Domain verification TXT added: yes
- Ready for real SMTP sending: no
- Ready for MX cutover: no
- Ready for production DNS changes: no
