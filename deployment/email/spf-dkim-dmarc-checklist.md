# SPF, DKIM, And DMARC Validation Checklist

Use this before any mail cutover or outbound sending. This phase provides an offline checklist only; it performs no live DNS lookups.

## SPF

- [ ] SPF TXT record exists for `iceskatingrinkrentals.com`.
- [ ] SPF includes the selected provider's documented include/mechanism.
- [ ] SPF keeps only one policy record at the root domain.
- [ ] SPF lookup count is reviewed and does not exceed provider/DNS limits where applicable.
- [ ] Legacy provider authorization is retained only while needed.
- [ ] SPF result is tested with a real test message after setup.

## DKIM

- [ ] DKIM selector names are documented.
- [ ] DKIM public record is present for each selected selector.
- [ ] DKIM private keys are stored only inside the selected provider or secure key storage, never in repo.
- [ ] DKIM signing is enabled for outbound mail.
- [ ] DKIM result is tested with a real test message after setup.

## DMARC

- [ ] DMARC TXT record exists at `_dmarc.iceskatingrinkrentals.com`.
- [ ] Initial policy is selected:
  - [ ] `none`
  - [ ] `quarantine`
  - [ ] `reject`
- [ ] Reporting address decision is made.
- [ ] Reporting mailbox or processor exists before reports are enabled.
- [ ] SPF alignment expectation is documented.
- [ ] DKIM alignment expectation is documented.
- [ ] Policy tightening plan is documented after monitoring.

## Required Tests

- [ ] Send an outbound test message from the selected provider to an external mailbox.
- [ ] Confirm SPF pass.
- [ ] Confirm DKIM pass.
- [ ] Confirm DMARC pass or expected monitoring result.
- [ ] Send inbound test messages to `contact@`, `quotes@`, and any selected admin recipient.
- [ ] Confirm aliases/forwards/mailboxes route as planned.
- [ ] Confirm Pumpkin still stores form leads in Lead Inbox regardless of email notification behavior.

