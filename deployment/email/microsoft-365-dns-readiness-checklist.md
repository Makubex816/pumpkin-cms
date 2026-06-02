# Microsoft 365 DNS Readiness Checklist

This checklist prepares IceSkatingRinkRentals.com for Microsoft 365 Exchange Online Plan 1 without changing DNS from code.

DNS host: Bluehost.

No DNS record is created, edited, deleted, or deployed by this repo.

## Domain Verification

- [x] Microsoft 365 Exchange Online Plan 1 purchased outside code.
- [x] Ice domain added to Microsoft 365 setup outside code.
- [x] Microsoft 365 verification TXT record added at Bluehost outside code.
- [x] Verification TXT documented:
  - Host/Name: `@`
  - TXT value: `MS=ms13281863`
  - TTL: `3600 / Bluehost 4 Hours`
  - Status: `added-at-bluehost`
- [ ] Complete or confirm Microsoft 365 domain verification in the admin center.

The verification TXT value is safe to document because it is not a credential. Do not document passwords, tokens, recovery codes, DKIM private keys, app passwords, OAuth secrets, or connection strings.

## MX Record

- [ ] Get the final MX value from the Microsoft 365 admin center.
- [ ] Use a placeholder only in Pumpkin docs: `MICROSOFT_365_MX_RECORD_REF`.
- [ ] Example pattern only: `TENANT_OR_DOMAIN_KEY.mail.protection.outlook.com`.
- [ ] Do not hard-code tenant-specific MX values in repo.
- [ ] Do not switch MX until the mailbox exists, aliases are confirmed, and inbound/outbound tests pass.
- [ ] Do not mark MX cutover ready in Pumpkin readiness files.

## SPF TXT

- [ ] Review the current SPF TXT record before editing.
- [ ] Microsoft 365 commonly requires the SPF include placeholder `include:spf.protection.outlook.com`.
- [ ] SPF must authorize Microsoft 365 before production sending.
- [ ] Merge Microsoft 365 with any other approved senders into one SPF TXT record.
- [ ] Do not create duplicate SPF records.
- [ ] Check SPF DNS lookup count before cutover.
- [ ] Final SPF enforcement (`~all` or `-all`) requires approval.

## DKIM CNAME/TXT

- [ ] Get DKIM selector CNAME/TXT values from the Microsoft 365 admin center or Exchange Online tooling.
- [ ] Expect Microsoft-managed selectors such as `selector1._domainkey` and `selector2._domainkey`, but do not commit tenant-specific targets.
- [ ] Create DKIM records only after approval.
- [ ] Enable DKIM signing in Microsoft 365 only after DNS records propagate.
- [ ] Enable DKIM for `iceskatingrinkrentals.com` before production sending.
- [ ] Do not store DKIM private keys in repo. Microsoft-managed private keys stay inside Microsoft 365.

## DMARC TXT

- [ ] Decide the DMARC reporting address.
- [ ] Start with monitoring policy `p=none` unless the user approves `quarantine` or `reject`.
- [ ] Publish DMARC before production sending.
- [ ] Confirm SPF and DKIM alignment expectations before stricter enforcement.
- [ ] Do not commit private mailbox credentials or reporting-service secrets.

## Autodiscover

- [ ] Confirm whether Microsoft 365 admin center requires an Exchange Online autodiscover CNAME for this domain.
- [ ] Placeholder ref: `MICROSOFT_365_AUTODISCOVER_CNAME_REF`.
- [ ] Use Microsoft-provided values only at setup time.

## TTL And Cutover

- [ ] Preserve current DNS until the Microsoft 365 mailbox is ready.
- [ ] Lower TTL only during an approved cutover window.
- [ ] Do not switch MX until mailbox login, alias routing, SPF, DKIM, DMARC, inbound, and outbound tests are ready.
- [ ] Pumpkin notification sending must be tested separately from Microsoft mailbox receiving.
- [ ] Keep a rollback note for the previous DNS state.

## Bluehost And Other Domains

- [ ] Ice currently has no known prior configured domain email.
- [ ] Other managed domains may still use Bluehost or another provider.
- [ ] Do not change other domains' MX records.
- [ ] Preserve Bluehost email DNS during website-only moves until a domain-specific migration is approved.

## Readiness Decision

- Domain verification TXT added: yes.
- Ready for receiving mail through Microsoft 365 MX: no.
- Ready for real SMTP/Graph sending: no.
- Ready for MX cutover: no.
- Ready for production DNS changes: no.

## References

- Microsoft 365 domain setup: https://learn.microsoft.com/en-us/microsoft-365/admin/setup/add-domain
- Microsoft 365 DNS records: https://learn.microsoft.com/en-us/microsoft-365/admin/get-help-with-domains/create-dns-records-at-any-dns-hosting-provider
- Microsoft 365 SPF guidance: https://learn.microsoft.com/en-us/microsoft-365/security/office-365-security/how-office-365-uses-spf-to-prevent-spoofing
- Microsoft 365 DKIM guidance: https://learn.microsoft.com/en-us/microsoft-365/security/office-365-security/email-authentication-dkim-configure
