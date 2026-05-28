# DNS Readiness Checklist

This checklist is for planning only. Do not create or change DNS records from this readiness layer.

## MX Records

- [ ] Selected provider's required MX hostnames and priorities are copied from official provider docs or account panel.
- [ ] Existing MX records are inventoried before any change.
- [ ] Bluehost or other legacy MX records are preserved until cutover is approved.
- [ ] No duplicate or conflicting provider MX sets remain after cutover.
- [ ] TTL plan is documented before switching.

## SPF TXT

- [ ] Current root-domain SPF TXT record is inventoried.
- [ ] Selected provider include/mechanism is documented.
- [ ] SPF has one root-domain policy record only.
- [ ] SPF DNS lookup count is reviewed before cutover.
- [ ] SPF does not authorize unneeded legacy senders after migration is complete.

## DKIM TXT Or CNAME

- [ ] Selected provider selector names are documented.
- [ ] DKIM public records are copied from provider docs/account panel.
- [ ] DKIM private keys are never committed to the repo.
- [ ] Selector ownership and rotation notes are recorded.
- [ ] Test message confirms DKIM pass after setup.

## DMARC TXT

- [ ] `_dmarc.iceskatingrinkrentals.com` policy is planned.
- [ ] Initial policy is selected: `none`, `quarantine`, or `reject`.
- [ ] Reporting address decision is made.
- [ ] Alignment expectations are documented.
- [ ] DMARC policy tightening path is recorded after monitoring.

## Optional MTA-STS

- [ ] Decide whether MTA-STS is needed for the selected provider.
- [ ] If used, document `_mta-sts` TXT record.
- [ ] If used, document HTTPS policy hosting requirement.
- [ ] Do not publish policy until hosting and certificate behavior are verified.

## Optional TLS-RPT

- [ ] Decide whether SMTP TLS reporting is needed.
- [ ] If used, document `_smtp._tls` TXT record.
- [ ] Choose reporting mailbox or external report processor.
- [ ] Do not point reports to an uncreated mailbox.

## Optional Autodiscover/Autoconfig

- [ ] Determine whether the selected provider supports autodiscover/autoconfig.
- [ ] Document any CNAME/SRV records from provider docs.
- [ ] Confirm records do not conflict with website hosting or Cloudflare behavior.

## Mail Host A Record

- [ ] Hosted mailbox providers usually do not need a domain-owned `mail` A record unless the provider docs require it.
- [ ] Self-hosted providers require a stable mail host record such as `mail.iceskatingrinkrentals.com`.
- [ ] Mail host address must not be guessed or copied from unrelated domains.

## Reverse DNS / PTR For Self-Hosted Mail

- [ ] Self-hosted mail requires reverse DNS/PTR controlled by the server/IP provider.
- [ ] PTR should align with the mail host name.
- [ ] Forward-confirmed reverse DNS is checked before outbound sending.
- [ ] If PTR cannot be set, self-hosted outbound mail remains blocked.

## TTL And Cutover Timing

- [ ] Lower TTL only after the selected provider setup is ready.
- [ ] Record the old TTL and intended temporary TTL.
- [ ] Schedule cutover window.
- [ ] Keep old provider active during overlap where applicable.
- [ ] Monitor inbound and outbound flow after cutover.
- [ ] Restore normal TTL after verification.

## Bluehost Preservation Rules

- [ ] Export or screenshot current Bluehost email/DNS settings before change.
- [ ] Do not delete Bluehost MX or mailbox settings until the selected provider is tested.
- [ ] Keep Bluehost active during overlap if any mailbox migration is needed.
- [ ] Cancel Bluehost email only after verification and retention needs are complete.

## Cloudflare And Azure DNS Warnings

- [ ] Do not edit Cloudflare from Pumpkin readiness docs or validators.
- [ ] Do not create Azure DNS zones or records from this phase.
- [ ] Confirm which DNS authority serves `iceskatingrinkrentals.com` before cutover.
- [ ] Avoid split-brain DNS changes between Cloudflare, registrar DNS, Bluehost, and Azure.
- [ ] Cloudflare proxy state does not apply to MX records, but nearby records should still be reviewed carefully.

