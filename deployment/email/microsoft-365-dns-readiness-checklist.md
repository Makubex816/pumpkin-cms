# Microsoft 365 DNS Readiness Checklist

This checklist prepares IceSkatingRinkRentals.com for Microsoft 365 Exchange Online Plan 1 without changing DNS.

No DNS record is created, edited, deleted, or deployed in this phase. Values must come from the Microsoft 365 admin center during setup.

## Domain Verification

- [ ] Add the Ice domain in the Microsoft 365 admin center.
- [ ] Record the Microsoft-provided verification TXT record as a secure operational note outside repo if needed.
- [ ] Do not commit tenant-specific verification values such as `MS=...`.
- [ ] Verify the domain only during the approved provider setup step.

## MX Record

- [ ] Get the final MX value from the Microsoft 365 admin center.
- [ ] Use a placeholder only in Pumpkin docs: `MICROSOFT_365_MX_RECORD_REF`.
- [ ] Example pattern only: `TENANT_OR_DOMAIN_KEY.mail.protection.outlook.com`.
- [ ] Do not hard-code tenant-specific MX values in repo.
- [ ] Do not switch MX until the mailbox exists, aliases are confirmed, and inbound/outbound tests pass.

## SPF TXT

- [ ] Review the current SPF TXT record before editing.
- [ ] Microsoft 365 commonly requires the SPF include placeholder `include:spf.protection.outlook.com`.
- [ ] Merge Microsoft 365 with any other approved senders into one SPF TXT record.
- [ ] Do not create duplicate SPF records.
- [ ] Check SPF DNS lookup count before cutover.
- [ ] Final SPF enforcement (`~all` or `-all`) requires approval.

## DKIM CNAME

- [ ] Get DKIM selector CNAME values from the Microsoft 365 admin center or Exchange Online tooling.
- [ ] Expect Microsoft-managed selectors such as `selector1._domainkey` and `selector2._domainkey`, but do not commit tenant-specific targets.
- [ ] Create DKIM CNAME records only after approval.
- [ ] Enable DKIM signing in Microsoft 365 only after DNS records propagate.
- [ ] Do not store DKIM private keys in repo. Microsoft-managed private keys stay inside Microsoft 365.

## DMARC TXT

- [ ] Decide the DMARC reporting address.
- [ ] Start with monitoring policy `p=none` unless the user approves `quarantine` or `reject`.
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
- [ ] Keep a rollback note for the previous DNS state.

## Bluehost And Other Domains

- [ ] Ice currently has no known configured domain email.
- [ ] Other managed domains may still use Bluehost or another provider.
- [ ] Do not change other domains' MX records.
- [ ] Preserve Bluehost email DNS during website-only moves until a domain-specific migration is approved.

## References

- Microsoft 365 domain setup: https://learn.microsoft.com/en-us/microsoft-365/admin/setup/add-domain
- Microsoft 365 DNS records: https://learn.microsoft.com/en-us/microsoft-365/admin/get-help-with-domains/create-dns-records-at-any-dns-hosting-provider
- Microsoft 365 SPF guidance: https://learn.microsoft.com/en-us/microsoft-365/security/office-365-security/how-office-365-uses-spf-to-prevent-spoofing
- Microsoft 365 DKIM guidance: https://learn.microsoft.com/en-us/microsoft-365/security/office-365-security/email-authentication-dkim-configure
