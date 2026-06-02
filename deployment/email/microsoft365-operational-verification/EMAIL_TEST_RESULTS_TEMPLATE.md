# Email Test Results Template

Use this template to record manual verification results. Do not store passwords, MFA codes, recovery codes, OAuth secrets, app passwords, SMTP passwords, DKIM private keys, provider tokens, or connection strings.

## Test Session

- Tester:
- Date:
- Environment:
- Microsoft account/mailbox: `contact@iceskatingrinkrentals.com`
- DNS host checked: Bluehost
- External test inbox provider:

## Outlook Access

- Outlook sign-in successful:
- Mailbox opens:
- Sender address correct:
- Display name correct:
- MFA configured:
- Recovery/security info configured:
- License/storage status healthy:
- Notes:

## Outbound Test

- Sent from:
- Sent to:
- Sent timestamp:
- Received timestamp:
- External inbox received:
- External spam/junk checked:
- Sender display name correct:
- SPF result:
- DKIM result:
- DMARC result:
- Notes:

## Inbound Reply Test

- Reply sent from external inbox:
- Reply sent timestamp:
- Reply received at `contact@iceskatingrinkrentals.com`:
- Received timestamp:
- Outlook spam/junk checked:
- Reply threading acceptable:
- Notes:

## DNS Verification

- Verification TXT present:
- MX points to Microsoft 365:
- SPF includes Microsoft 365:
- DKIM records present:
- DKIM enabled:
- DMARC exists:
- Autodiscover present if required:
- Website DNS unchanged:
- Other domains unchanged:
- Notes:

## Pumpkin Readiness

- Graph vs SMTP decision:
- Runtime refs configured outside repo:
- `EMAIL_SEND_MODE` still dry-run:
- Outbound logging ready:
- Failure handling reviewed:
- Lead notification dry-run tested:
- Autoresponder dry-run tested:
- Notes:

## Result Summary

- Microsoft mailbox operational verification:
- Pumpkin real email sending:
- Public email display:
- MX/DNS production confidence:
- Next action:
