# Pumpkin Email Infrastructure Readiness

This folder is Pumpkin's provider-agnostic email readiness layer for IceSkatingRinkRentals.com.

It prepares the contracts, manifests, templates, DNS checklists, SMTP placeholder refs, logging shape, migration notes, and no-secret guardrails needed before a live provider is selected. It does not choose a provider, create mailboxes, change DNS, configure SMTP credentials, send email, touch Cloudflare, touch Azure, touch Bluehost, import CMS content, update CMS Page/Theme records, regenerate production static packages, deploy, or add active GitHub workflows.

RollerRinkRentals.com remains paused.

## Primary Site

- Tenant: `ice-rink-rentals`
- Site key: `ice-rink-rentals`
- Domain: `iceskatingrinkrentals.com`
- Provider decision: pending
- SMTP sending: disabled and dry-run-only
- MX cutover: blocked until provider selection and DNS approval

## Files

- `provider-options.md` documents the provider configuration contract and candidate option notes.
- `provider-presets.template.json` stores placeholder-safe provider preset refs for Purelymail, Cloudflare Email Routing, Migadu, MXroute, Google Workspace, Bluehost legacy, Mailcow, Mail-in-a-Box, Mailu, Modoboa, Stalwart, and custom providers.
- `ice-domain-email-settings.template.json` is the Ice domain-level email settings contract.
- `mailbox-alias-manifest.template.json` proposes the Ice mailbox/alias manifest without marking anything as created.
- `smtp-submission-config.template.json` records SMTP placeholder refs only and keeps sending disabled.
- `dns-readiness-checklist.md` covers MX, SPF, DKIM, DMARC, optional hardening records, TTL/cutover timing, Bluehost preservation, and Cloudflare/Azure warnings.
- `spf-dkim-dmarc-checklist.md` is the pre-cutover authentication checklist.
- `lead-notification-template.ice.json` is the internal lead notification template draft.
- `autoresponder-template.ice.json` is the customer autoresponder template draft.
- `outbound-email-log-contract.md` documents the outbound email log model.
- `inbound-routing-notes.md` documents inbound routing behavior and future ingestion options.
- `bluehost-migration-checklist.md` documents migration steps from legacy/Bluehost-style mail to a selected provider.
- `no-secret-email-guardrails.md` documents repository and validation guardrails.
- `validate-email-readiness-fixtures.mjs` validates the local offline fixtures.
- `fixtures/email-readiness-cases.json` contains valid and invalid contract examples.

## Offline Validation

From the repo root:

```powershell
node deployment/email/validate-email-readiness-fixtures.mjs
```

The validator only reads committed JSON fixtures and templates. It performs no DNS lookups, no SMTP connection, no mailbox creation, no API calls, and no email sending.

## Current Readiness

- Ready for provider decision: yes
- Ready for real SMTP sending: no
- Ready for MX cutover: no
- Ready for production DNS changes: no

Before real sending, Pumpkin still needs a selected provider, secure runtime secret storage, approved DNS records, verified SPF/DKIM/DMARC, test messages, inbound/outbound tests, suppression/error policy, and explicit sending approval.

