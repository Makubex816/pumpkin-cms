# Pumpkin Email Infrastructure Readiness System Report

## Scope

Built Pumpkin's provider-agnostic Email Infrastructure Readiness Layer for the IceSkatingRinkRentals.com launch path.

This phase does not select an email provider, send real email, configure SMTP credentials, create mailboxes, create DNS records, edit Cloudflare, edit Bluehost, create Azure resources, import CMS content, update live CMS Page records, update live CMS Theme records, regenerate production static packages, deploy, or create GitHub workflows.

RollerRinkRentals.com remains paused.

## Git Status At Start

Required start checks were run from the actual Git root, `C:\Users\User\Desktop\PumpkinCMS\pumpkin-cms`.

`git status --short` at start:

```text

```

The starting worktree was clean.

`git log --oneline -12` at start:

```text
3526250 Add Ice import readiness input request package
bbf848f Add Ice homepage media upload selection manifest
52d4c9c Add Phase 8C.14B page intake normalizer
7b6c7fe Add Phase 8C.15 Ice homepage media binding manifest
cb3e6fb Add Phase 8C.14 Ice homepage media intake validation
9c8fc83 Add Phase 8C.13 Ice final approval resolution package
96eea2d Add Phase 8C.12 Ice final import prep package
bdf073a Add Phase 8C.11C .NET page contract alignment
337abbe Add Phase 8C.11B Tailwind and navigation hardening
5e0be5d Add Phase 8C.11 production default contact form system
047a743 Add Phase 8C.10 Ice import candidate prep bundle
bb0981d Add Phase 8C.9 production media pipeline
```

## Existing Capability Assessment

Pumpkin already has:

- `FormEntry` contracts in TypeScript and .NET.
- Lead Inbox admin views for tenant-scoped form submissions.
- Runtime Ice contact API forwarding to Pumpkin `FormEntry`.
- A static form endpoint foundation under `deployment/static-azure/forms/static-form-endpoint`.
- Default contact and quote form definitions using non-secret `staticEndpointRef`, `leadRecipientRef`, and `notificationEmailRef` refs.
- Import/export validators that preserve form definitions and warn on risky form/static metadata.
- Existing no-secret guardrails for protected config, deployment, import, and static publishing workflows.

Gap before this phase: Pumpkin had form intake and Lead Inbox, but no provider-agnostic email configuration layer, mailbox manifest, SMTP placeholder contract, DNS checklist, email templates, outbound email log contract, inbound routing notes, migration checklist, or targeted email-secret guardrails.

## Files Changed

- `deployment/email/README.md`
- `deployment/email/provider-options.md`
- `deployment/email/provider-presets.template.json`
- `deployment/email/ice-domain-email-settings.template.json`
- `deployment/email/mailbox-alias-manifest.template.json`
- `deployment/email/smtp-submission-config.template.json`
- `deployment/email/dns-readiness-checklist.md`
- `deployment/email/spf-dkim-dmarc-checklist.md`
- `deployment/email/lead-notification-template.ice.json`
- `deployment/email/autoresponder-template.ice.json`
- `deployment/email/outbound-email-log-contract.md`
- `deployment/email/inbound-routing-notes.md`
- `deployment/email/bluehost-migration-checklist.md`
- `deployment/email/no-secret-email-guardrails.md`
- `deployment/email/fixtures/email-readiness-cases.json`
- `deployment/email/validate-email-readiness-fixtures.mjs`
- `PUMPKIN_EMAIL_INFRASTRUCTURE_READINESS_SYSTEM_REPORT.md`

## Provider-Agnostic Architecture

The new readiness layer is file-based and offline. It prepares:

- provider candidate profiles
- tenant/domain settings
- mailbox and alias manifest
- DNS/authentication cutover checklists
- SMTP submission refs only
- internal lead notification template draft
- customer autoresponder template draft
- outbound email log contract
- inbound routing notes
- legacy/Bluehost migration checklist
- email-specific no-secret guardrails
- fixture validator

All provider-sensitive runtime values are represented as refs. Real values must live later in approved secure runtime configuration, not in repo files.

## Provider Presets Created

`provider-presets.template.json` includes placeholder-safe profiles for:

- `purelymail`
- `cloudflare-email-routing`
- `migadu`
- `mxroute`
- `google-workspace`
- `bluehost-legacy`
- `mailcow`
- `mail-in-a-box`
- `mailu`
- `modoboa`
- `stalwart`
- `custom`

No preset stores real provider credentials or real DNS record values.

## Ice Domain Email Settings

`ice-domain-email-settings.template.json` records:

- `tenantId`: `ice-rink-rentals`
- `siteKey`: `ice-rink-rentals`
- `domain`: `iceskatingrinkrentals.com`
- provider decision: `pending-provider-decision`
- SMTP: disabled
- outbound: dry-run-only
- MX/DNS/cutover: not configured and blocked until approval

## Mailbox And Alias Manifest

`mailbox-alias-manifest.template.json` proposes these Ice addresses only:

- `contact@iceskatingrinkrentals.com`
- `quotes@iceskatingrinkrentals.com`
- `admin@iceskatingrinkrentals.com`
- `no-reply@iceskatingrinkrentals.com`

Every address is marked `proposed/pending-provider-decision`. Nothing is marked created.

## DNS Readiness Checklist

`dns-readiness-checklist.md` covers:

- MX records
- SPF TXT
- DKIM TXT/CNAME
- DMARC TXT
- optional MTA-STS
- optional TLS-RPT
- optional autodiscover/autoconfig
- mail host A record
- reverse DNS/PTR for self-hosted mail
- TTL and cutover timing
- Bluehost preservation rules
- Cloudflare/Azure DNS warnings

## SPF/DKIM/DMARC Checklist

`spf-dkim-dmarc-checklist.md` covers:

- SPF existence and provider inclusion
- SPF DNS lookup limit review
- DKIM selectors and public records
- DMARC record, policy, reporting, and alignment
- required inbound/outbound test email validation

## SMTP Placeholder Config

`smtp-submission-config.template.json` uses refs only:

- SMTP host, port, username, password, secure mode
- from, reply-to, bounce, notification, autoresponder addresses
- daily send limit

Defaults:

- `enabled`: false
- `dryRunOnly`: true

## Lead Notification Template

`lead-notification-template.ice.json` adds `ice-lead-notification-default`.

Purpose: notify the internal/admin recipient ref when a new Ice quote request `FormEntry` arrives.

Status: `draft`. It sends no real email.

## Autoresponder Template

`autoresponder-template.ice.json` adds `ice-quote-request-autoresponder-default`.

Purpose: customer confirmation after a quote request submission.

Status: `draft`, `enabled: false`, `dryRunOnly: true`, and `consentRequired: true`.

## Outbound Email Log Contract

`outbound-email-log-contract.md` documents `OutboundEmailLog` with:

- tenant/site/provider/template fields
- FormEntry relationship fields
- recipient hash or safe summary by default
- optional full recipient email only after privacy approval
- refs for from/reply-to addresses
- safe subject preview
- statuses: `queued`, `dry-run`, `sent`, `failed`, `suppressed`, `blocked`
- safe provider/error metadata

It explicitly forbids logging secrets and full raw email payloads by default.

## Inbound Routing Notes

`inbound-routing-notes.md` documents:

- mailbox provider receives direct email after setup
- Pumpkin Lead Inbox remains the source of truth for form leads
- inbound mailbox replies are provider-handled at first
- optional future IMAP/JMAP/webhook ingestion
- alias routing strategy
- no-reply behavior
- reply-to strategy for form notifications

No inbound ingestion was built.

## Migration Checklist

`bluehost-migration-checklist.md` covers:

- inventorying mailboxes, aliases, forwards, catch-all, autoresponders, and DNS
- preserving current MX until ready
- creating selected provider account/mailboxes/aliases manually later
- SPF/DKIM/DMARC setup
- inbound/outbound tests
- optional IMAP migration
- TTL lowering
- MX switching
- overlap monitoring
- old-provider cancellation only after verification

It notes that Ice currently has no email setup yet, so Ice migration is easier, while other managed domains may require mailbox migration.

## No-Secret Guardrails

`no-secret-email-guardrails.md` adds email-specific guardrails for:

- SMTP passwords
- email provider passwords
- mailbox passwords
- app passwords
- OAuth secrets
- provider API tokens
- DKIM private keys
- recovery codes
- protected config files

Targeted pattern names documented:

- `SMTP_PASSWORD`
- `EMAIL_PASSWORD`
- `DKIM_PRIVATE_KEY`
- `SENDGRID_API_KEY`
- `MAILGUN_API_KEY`
- `POSTMARK_API_TOKEN`
- `PURELYMAIL_PASSWORD`
- `GOOGLE_APP_PASSWORD`
- `MXROUTE_PASSWORD`
- `MIGADU_PASSWORD`
- `MAILCOW_API_KEY`

Only placeholder refs are committed.

## Validators And Fixtures Added

`validate-email-readiness-fixtures.mjs` validates:

- valid provider config
- provider config with synthetic secret-like value blocked
- valid mailbox manifest
- mailbox manifest with invalid domain blocked
- valid SMTP config using refs only
- SMTP config with literal password blocked
- valid lead notification template
- template with unsupported variable warned
- valid autoresponder template
- outbound log contract shape
- required DNS checklist sections
- required SPF/DKIM/DMARC checklist sections
- Ice domain email settings template validation
- provider preset file coverage

The validator is offline and performs no DNS, SMTP, API, provider, Azure, Cloudflare, or mailbox actions.

## Admin UI Changes

No admin UI changes were made in this phase.

Reason: a useful admin Email Readiness section would need durable backend/settings storage and a later decision about how email readiness state is persisted. Adding docs/templates/validators now keeps the layer provider-agnostic and avoids accidental CMS/database mutations.

Remaining admin UI work: add an Email Readiness page showing provider status, manifest status, DNS readiness, SMTP dry-run state, template readiness, blockers before sending, and blockers before DNS cutover.

## Checks Run

- `git status --short` at start: clean.
- `git log --oneline -12` at start: captured above.
- `node deployment/email/validate-email-readiness-fixtures.mjs`: passed with 14 fixture checks.
- JSON parse validation for created JSON templates: passed for 7 JSON files.
- `node --check deployment/email/validate-email-readiness-fixtures.mjs`: passed.
- `git diff --check`: passed.
- Direct trailing whitespace scan over `deployment/email` and this report: passed.
- Protected config/workflow/generated-folder check: passed. No `.env.local`, `appsettings.Development.json`, `.github/workflows`, `.next`, `node_modules`, static dry-run folders, ZIPs, or raw media files are in the changed file set.
- Targeted email secret-value scan: passed. The only synthetic invalid canary is inside validator fixtures and is expected to be blocked by the validator.
- No generated static folders staged: passed.
- No ZIPs staged: passed.
- No raw media files staged: passed.
- No protected config modified: passed.
- TypeScript type-check: not run because no TypeScript files changed.
- `dotnet build`: not run because no .NET files changed.

## Known Limitations

- No live DNS lookup validator was added. The current phase is offline checklist validation only.
- No SMTP provider is selected.
- No SMTP credentials are configured.
- No outbound email sending code path is enabled.
- No outbound email database container/model implementation is added yet.
- No inbound mailbox ingestion exists yet.
- No admin Email Readiness UI exists yet.
- No DNS records are created or changed.

## Readiness Decisions

- Ready for provider decision: yes
- Ready for real SMTP sending: no
- Ready for MX cutover: no
- Ready for production DNS changes: no

## Remaining Before Real Email Sending

- Select provider.
- Create provider account/mailboxes/aliases manually.
- Store SMTP/provider secrets in approved secure runtime configuration.
- Configure and verify SPF/DKIM/DMARC.
- Implement outbound email sending behind dry-run and approval gates.
- Implement `OutboundEmailLog` persistence.
- Run outbound test messages.
- Approve suppression, retry, privacy, and error logging policies.

## Remaining Before DNS/MX Cutover

- Inventory current DNS and any legacy Bluehost records.
- Choose exact provider DNS records from official/provider account docs.
- Lower TTL at the approved time.
- Configure mailboxes/aliases first.
- Verify inbound and outbound behavior.
- Switch MX during an approved cutover window.
- Monitor delivery.
- Keep legacy provider active during overlap where applicable.
