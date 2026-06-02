# Pumpkin Email Infrastructure Readiness

This folder is Pumpkin's provider-aware email readiness layer for IceSkatingRinkRentals.com.

It prepares the contracts, manifests, templates, DNS checklists, SMTP/Graph placeholder refs, logging shape, migration notes, and no-secret guardrails needed before live email is enabled. Microsoft 365 Exchange Online Plan 1 is selected for IceSkatingRinkRentals.com and partially set up outside code through Bluehost TXT verification.

This layer does not create mailboxes, change DNS, configure SMTP or Graph credentials, send email, touch Cloudflare, touch Azure, touch Bluehost, import CMS content, update CMS Page/Theme records, regenerate production static packages, deploy, or add active GitHub workflows.

RollerRinkRentals.com remains paused.

## Primary Site

- Tenant: `ice-rink-rentals`
- Site key: `ice-rink-rentals`
- Domain: `iceskatingrinkrentals.com`
- Selected provider: `microsoft-365-exchange-online-plan-1`
- Provider status: `selected`
- DNS host: Bluehost
- Domain verification status: `txt-record-added`
- Verification TXT: `@ TXT MS=ms13281863`
- Primary mailbox/user: `contact@iceskatingrinkrentals.com`
- Application sending path: Graph/OAuth-ready first, SMTP AUTH fallback only if explicitly enabled later
- SMTP/Graph sending: disabled and dry-run-only
- MX cutover: not ready
- Production DNS changes: not ready

## Files

- `provider-options.md` documents the provider configuration contract, selected Microsoft 365 provider, and reference alternatives.
- `provider-presets.template.json` stores placeholder-safe reference provider preset refs for Microsoft 365, Purelymail, Cloudflare Email Routing, Migadu, MXroute, Google Workspace, Bluehost legacy, Mailcow, Mail-in-a-Box, Mailu, Modoboa, Stalwart, and custom providers.
- `microsoft-365-exchange-online-plan-1.md` documents the selected Ice provider and Bluehost verification state.
- `provider-microsoft-365-exchange-online-plan-1.template.json` records the selected provider profile using refs only.
- `ice-domain-email-settings.template.json` remains the generic Ice domain-level email settings contract.
- `ice-domain-email-settings.microsoft365.template.json` records selected Ice domain settings for Microsoft 365 and Bluehost TXT verification.
- `mailbox-alias-manifest.template.json` remains the generic Ice mailbox/alias manifest.
- `mailbox-alias-manifest.ice.microsoft365.template.json` records the selected primary mailbox/user and proposed aliases without creating anything by code.
- `smtp-submission-config.template.json` records Microsoft 365 SMTP placeholder refs only and keeps sending disabled.
- `microsoft-365-app-sending-config.template.json` records Graph/OAuth-first app sending placeholders with SMTP AUTH fallback disabled.
- `dns-readiness-checklist.md` covers generic MX, SPF, DKIM, DMARC, optional hardening records, TTL/cutover timing, Bluehost preservation, and Cloudflare/Azure warnings.
- `microsoft-365-dns-readiness-checklist.md` covers Microsoft 365 DNS readiness without making DNS changes.
- `microsoft365-operational-verification/` contains manual Outlook, inbound/outbound, DNS, Pumpkin app-send, Graph-vs-SMTP, public display, and test-results checklists.
- `spf-dkim-dmarc-checklist.md` is the pre-cutover authentication checklist.
- `lead-notification-template.ice.json` is the internal lead notification template draft.
- `autoresponder-template.ice.json` is the customer autoresponder template draft.
- `outbound-email-log-contract.md` documents the outbound email log model.
- `inbound-routing-notes.md` documents inbound Exchange Online routing behavior and future ingestion options.
- `bluehost-migration-checklist.md` documents migration boundaries for legacy/Bluehost-style mail to a selected provider.
- `no-secret-email-guardrails.md` documents repository and validation guardrails.
- `validate-email-readiness-fixtures.mjs` validates the local offline fixtures.
- `fixtures/email-readiness-cases.json` contains valid and invalid contract examples.

## Offline Validation

From the repo root:

```powershell
node deployment/email/validate-email-readiness-fixtures.mjs
```

The validator only reads committed JSON fixtures and templates. It performs no DNS lookups, no SMTP connection, no mailbox creation, no Microsoft 365 API calls, and no email sending.

## Current Readiness

- Ready for provider decision: yes
- Domain verification TXT added: yes
- Microsoft mailbox operational verification: pending manual tests
- Ready for real SMTP/Graph sending: no
- Ready for MX cutover: no
- Ready for production DNS changes: no

Before real sending, Pumpkin still needs Microsoft 365 domain setup completion, secure runtime secret storage, approved MX/SPF/DKIM/DMARC records, Microsoft Graph or explicitly enabled SMTP AUTH configuration, test messages, inbound/outbound tests, suppression/error policy, and explicit sending approval.
