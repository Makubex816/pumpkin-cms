# Pumpkin Email Infrastructure Readiness

This folder is Pumpkin's provider-aware email readiness layer for IceSkatingRinkRentals.com.

It prepares the contracts, manifests, templates, DNS checklists, SMTP/Graph placeholder refs, logging shape, migration notes, and no-secret guardrails needed before a live provider is configured. Microsoft 365 Exchange Online Plan 1 is selected for IceSkatingRinkRentals.com, but it is not configured.

This layer does not create mailboxes, change DNS, configure SMTP or Graph credentials, send email, touch Cloudflare, touch Azure, touch Bluehost, import CMS content, update CMS Page/Theme records, regenerate production static packages, deploy, or add active GitHub workflows.

RollerRinkRentals.com remains paused.

## Primary Site

- Tenant: `ice-rink-rentals`
- Site key: `ice-rink-rentals`
- Domain: `iceskatingrinkrentals.com`
- Selected provider: `microsoft-365-exchange-online-plan1`
- Provider status: `selected-not-configured`
- Application sending path: Graph/OAuth-ready first, SMTP AUTH fallback only if explicitly enabled later
- SMTP/Graph sending: disabled and dry-run-only
- MX cutover: blocked until Microsoft 365 setup, mailbox creation, DNS approval, and tests pass

## Files

- `provider-options.md` documents the provider configuration contract, selected Microsoft 365 provider, and reference alternatives.
- `provider-presets.template.json` stores placeholder-safe reference provider preset refs for Purelymail, Cloudflare Email Routing, Migadu, MXroute, Google Workspace, Bluehost legacy, Mailcow, Mail-in-a-Box, Mailu, Modoboa, Stalwart, and custom providers.
- `microsoft-365-exchange-online-plan1.md` documents the selected Ice provider.
- `provider-microsoft-365-exchange-online-plan1.template.json` records the selected provider profile using refs only.
- `ice-domain-email-settings.template.json` remains the generic Ice domain-level email settings contract.
- `ice-domain-email-settings.microsoft365.template.json` records selected-not-configured Ice domain settings for Microsoft 365.
- `mailbox-alias-manifest.template.json` remains the generic Ice mailbox/alias manifest.
- `mailbox-alias-manifest.ice.microsoft365.template.json` records proposed Microsoft 365 mailbox/alias setup without marking anything created.
- `smtp-submission-config.template.json` records Microsoft 365 SMTP placeholder refs only and keeps sending disabled.
- `microsoft-365-app-sending-config.template.json` records Graph/OAuth-first app sending placeholders with SMTP AUTH fallback disabled.
- `dns-readiness-checklist.md` covers generic MX, SPF, DKIM, DMARC, optional hardening records, TTL/cutover timing, Bluehost preservation, and Cloudflare/Azure warnings.
- `microsoft-365-dns-readiness-checklist.md` covers Microsoft 365 DNS readiness without making DNS changes.
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

- Ready for provider setup: yes
- Ready for real SMTP/Graph sending: no
- Ready for MX cutover: no
- Ready for production DNS changes: no

Before real sending, Pumpkin still needs Microsoft 365 purchase/setup, secure runtime secret storage, approved DNS records, verified SPF/DKIM/DMARC, Microsoft Graph or explicitly enabled SMTP AUTH configuration, test messages, inbound/outbound tests, suppression/error policy, and explicit sending approval.
