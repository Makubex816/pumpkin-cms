# Inbound And Outbound Test Checklist

Use this checklist manually from Outlook and an external mailbox. Do not send email from Pumpkin code.

## Outbound Test

- [ ] Send a plain text message from `contact@iceskatingrinkrentals.com` to an external Gmail or other outside inbox.
- [ ] Confirm the external inbox receives the message.
- [ ] Check the external inbox spam/junk folder if the message is not in the inbox.
- [ ] Record sent timestamp.
- [ ] Record received timestamp.
- [ ] Confirm sender address is `contact@iceskatingrinkrentals.com`.
- [ ] Confirm display name is correct.
- [ ] Inspect message headers if available.
- [ ] Record whether SPF passed.
- [ ] Record whether DKIM passed.
- [ ] Record whether DMARC passed or produced the expected result.

## Inbound Reply Test

- [ ] Reply from the external inbox to `contact@iceskatingrinkrentals.com`.
- [ ] Confirm the reply arrives in Outlook.
- [ ] Check Outlook spam/junk if it does not arrive in the inbox.
- [ ] Record sent timestamp.
- [ ] Record received timestamp.
- [ ] Confirm reply threading works as expected.
- [ ] Confirm the reply should continue to go to `contact@iceskatingrinkrentals.com` or document whether a future alias/reply-to should be used.

## Alias And Reply Policy Notes

- [ ] Decide whether replies should remain on `contact@`.
- [ ] Decide whether `quotes@`, `admin@`, or `no-reply@` should be configured later.
- [ ] Do not assume aliases can send independently until Microsoft 365 send-as/send-on-behalf behavior is verified.

## Result

- Status: pending manual verification.
- Evidence location: use `EMAIL_TEST_RESULTS_TEMPLATE.md`.

Do not include credentials, tokens, private headers containing secrets, or full raw message payloads in this repo.
