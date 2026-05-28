# Bluehost And Legacy Mail Migration Checklist

Use this checklist when moving a managed domain from Bluehost or another legacy provider to a selected provider.

IceSkatingRinkRentals.com currently has no email setup yet, so migration is easier for Ice. Other managed domains may require mailbox migration.

## Inventory

- [ ] Inventory existing mailboxes.
- [ ] Inventory existing aliases.
- [ ] Inventory existing forwards.
- [ ] Inventory catch-all behavior.
- [ ] Inventory mailing lists or groups.
- [ ] Inventory autoresponders.
- [ ] Export or screenshot current DNS records.
- [ ] Export mailbox size and retention requirements.

## Preserve Current Service

- [ ] Preserve current MX records until the new provider is ready.
- [ ] Keep old provider active during overlap.
- [ ] Do not cancel Bluehost or legacy email during DNS transition.
- [ ] Record login/admin access requirements without committing credentials.

## Prepare Selected Provider

- [ ] Create new provider account manually after final decision.
- [ ] Create approved mailboxes manually.
- [ ] Create approved aliases manually.
- [ ] Create approved forwards manually.
- [ ] Configure SPF from provider docs.
- [ ] Configure DKIM from provider docs.
- [ ] Configure DMARC policy and reporting decision.
- [ ] Configure SMTP submission in secure runtime config, not repo files.

## Test Before Cutover

- [ ] Test provider webmail/login.
- [ ] Test outbound from new provider.
- [ ] Test DKIM signing.
- [ ] Test SPF/DMARC result.
- [ ] Test inbound if provider supports pre-cutover validation.
- [ ] Test Pumpkin dry-run logging only until sending is approved.

## IMAP Migration

- [ ] Decide whether old mail must be migrated.
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
- [ ] SMTP config remains refs only in repo.
- [ ] Real SMTP secrets live only in approved secure runtime config.
- [ ] Lead notification template is reviewed.
- [ ] Autoresponder template is reviewed and consent policy is approved.
- [ ] Outbound email logging is enabled before real sending.
- [ ] Lead Inbox remains the source of truth for form submissions.

