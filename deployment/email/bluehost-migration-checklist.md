# Bluehost And Legacy Mail Migration Checklist

Use this checklist when moving a managed domain from Bluehost or another legacy provider to a selected provider.

IceSkatingRinkRentals.com currently has no known prior email setup, so no IMAP mailbox migration is required unless a mailbox is later discovered. Microsoft 365 Exchange Online Plan 1 is selected for Ice, the verification TXT record was added at Bluehost outside code, and no MX cutover or email migration happens in this phase.

Other managed domains may continue using Bluehost or another existing email provider. Do not change other domains' MX records unless a separate domain-specific migration is explicitly approved.

## Inventory

- [ ] Inventory existing mailboxes.
- [ ] Inventory existing aliases.
- [ ] Inventory existing forwards.
- [ ] Inventory catch-all behavior.
- [ ] Inventory mailing lists or groups.
- [ ] Inventory autoresponders.
- [ ] Export or screenshot current DNS records.
- [ ] Export mailbox size and retention requirements.
- [ ] For other managed domains, confirm whether Bluehost email is still active before any website-only DNS move.

## Preserve Current Service

- [ ] Preserve current MX records until the new provider is ready.
- [ ] Preserve Bluehost email DNS during website-only moves.
- [ ] Keep old provider active during overlap.
- [ ] Do not cancel Bluehost or legacy email during DNS transition.
- [ ] Do not change other domains' MX records during the Ice Microsoft 365 setup.
- [ ] For Ice, document that `@ TXT MS=ms13281863` was added at Bluehost outside code.
- [ ] Record login/admin access requirements without committing credentials.

## Prepare Selected Provider

- [ ] Create Microsoft 365 provider account manually after final approval.
- [ ] Create approved mailboxes manually.
- [ ] Create approved aliases manually.
- [ ] Create approved forwards manually.
- [ ] Configure SPF from provider docs.
- [ ] Configure DKIM from provider docs.
- [ ] Configure DMARC policy and reporting decision.
- [ ] Configure Graph/OAuth refs in secure runtime config, not repo files.
- [ ] Configure SMTP AUTH fallback in secure runtime config only if explicitly approved later.

## Test Before Cutover

- [ ] Test provider webmail/login.
- [ ] Test outbound from new provider.
- [ ] Test DKIM signing.
- [ ] Test SPF/DMARC result.
- [ ] Test inbound if provider supports pre-cutover validation.
- [ ] Test Pumpkin dry-run logging only until sending is approved.

## IMAP Migration

- [ ] Decide whether old mail must be migrated.
- [ ] If migrating another domain later, inventory mailboxes, aliases, forwards, catch-all behavior, and retention needs before any MX change.
- [ ] If needed, run IMAP migration through provider tools or approved migration utility.
- [ ] Verify migrated folder counts and samples.
- [ ] Keep old provider active long enough to compare.

## Cutover

- [ ] Lower TTL before cutover only after readiness is confirmed.
- [ ] Switch MX records during an approved window.
- [ ] Update SPF/DKIM/DMARC as required.
- [ ] Monitor inbound mail.
- [ ] Monitor outbound delivery and authentication.
- [ ] Keep old provider active during overlap.
- [ ] Cancel old provider only after verification and retention needs are complete.

## Pumpkin-Specific Checks

- [ ] Domain settings point to the selected provider key.
- [ ] For Ice, selected provider key is `microsoft-365-exchange-online-plan-1`.
- [ ] SMTP config remains refs only in repo.
- [ ] Real Graph/OAuth and SMTP secrets live only in approved secure runtime config.
- [ ] Lead notification template is reviewed.
- [ ] Autoresponder template is reviewed and consent policy is approved.
- [ ] Outbound email logging is enabled before real sending.
- [ ] Lead Inbox remains the source of truth for form submissions.

## Other-Domain Boundary

- [ ] Do not migrate or modify Bluehost email for other domains in the Ice provider-selection phase.
- [ ] Keep existing Bluehost MX records for other domains until intentionally migrated.
- [ ] Inventory each other domain independently before selecting a provider or changing DNS.

RollerRinkRentals.com remains paused.
