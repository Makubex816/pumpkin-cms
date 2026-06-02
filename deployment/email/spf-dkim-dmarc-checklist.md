# SPF, DKIM, And DMARC Validation Checklist

Use this before any mail cutover or outbound sending. This phase provides an offline checklist only; it performs no live DNS lookups.

Microsoft 365 Exchange Online Plan 1 is selected for Ice. DNS host is Bluehost. The Microsoft 365 verification TXT record `@ TXT MS=ms13281863` has been added outside code, but SPF, DKIM, DMARC, inbound tests, outbound tests, and Pumpkin notification tests remain required before production sending or MX cutover.

## SPF

- [ ] SPF TXT record exists for `iceskatingrinkrentals.com`.
- [ ] SPF includes Microsoft 365's documented include/mechanism before production sending.
- [ ] SPF keeps only one policy record at the root domain.
- [ ] SPF lookup count is reviewed and does not exceed provider/DNS limits where applicable.
- [ ] Legacy provider authorization is retained only while needed.
- [ ] SPF result is tested with a real test message after setup.

## DKIM

- [ ] DKIM selector names are documented.
- [ ] DKIM public record is present for each Microsoft 365 selector.
- [ ] DKIM private keys are stored only inside Microsoft 365 or secure key storage, never in repo.
- [ ] DKIM signing is enabled for `iceskatingrinkrentals.com` before production sending.
- [ ] DKIM result is tested with a real test message after setup.

## DMARC

- [ ] DMARC TXT record exists at `_dmarc.iceskatingrinkrentals.com`.
- [ ] DMARC is published before production sending.
- [ ] Initial policy is selected:
  - [ ] `none`
  - [ ] `quarantine`
  - [ ] `reject`
- [ ] Start DMARC policy carefully; use monitoring policy first unless stricter enforcement is explicitly approved.
- [ ] Reporting address decision is made.
- [ ] Reporting mailbox or processor exists before reports are enabled.
- [ ] SPF alignment expectation is documented.
- [ ] DKIM alignment expectation is documented.
- [ ] Policy tightening plan is documented after monitoring.

## Required Tests

- [ ] Send an outbound test message from Microsoft 365 to an external mailbox.
- [ ] Confirm SPF pass.
- [ ] Confirm DKIM pass.
- [ ] Confirm DMARC pass or expected monitoring result.
- [ ] Send inbound test messages to `contact@`, `quotes@`, and any selected admin recipient.
- [ ] Confirm aliases/forwards/mailboxes route as planned.
- [ ] Confirm Pumpkin still stores form leads in Lead Inbox regardless of email notification behavior.
- [ ] Test Pumpkin lead notification sending separately from Microsoft mailbox receiving.
- [ ] Keep Pumpkin notification/autoresponder templates disabled or dry-run until approved.
