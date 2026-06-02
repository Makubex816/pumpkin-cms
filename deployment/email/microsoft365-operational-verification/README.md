# Microsoft 365 Operational Verification

This folder documents the manual operational checks needed before IceSkatingRinkRentals.com relies on Microsoft 365 email or before Pumpkin sends real lead notifications/autoresponders.

Current known state:

- Microsoft 365 Exchange Online Plan 1 is selected for Ice.
- Primary mailbox/user: `contact@iceskatingrinkrentals.com`.
- DNS host: Bluehost.
- Microsoft 365 setup screen reported domain email setup is all set to use email.
- Verification TXT record added outside code: `@ TXT MS=ms13281863`.
- Pumpkin email sending remains disabled and dry-run-only.

No checklist in this folder sends email from code, logs into Microsoft 365 from code, changes DNS, stores credentials, updates CMS records, regenerates static packages, deploys, or touches RollerRinkRentals.com.

## Files

- `OUTLOOK_ACCESS_CHECKLIST.md`: manual Outlook mailbox access and account readiness checks.
- `INBOUND_OUTBOUND_TEST_CHECKLIST.md`: manual send/receive test plan using external inboxes.
- `DNS_RECORD_VERIFICATION_CHECKLIST.md`: manual DNS verification checklist for Microsoft 365 records at Bluehost.
- `PUMPKIN_APP_SEND_READINESS_CHECKLIST.md`: Pumpkin app-send blockers before real notifications/autoresponders.
- `MICROSOFT_365_GRAPH_VS_SMTP_DECISION.md`: Graph vs SMTP AUTH decision notes.
- `EMAIL_PUBLIC_DISPLAY_POLICY.md`: public email display options and recommendation.
- `EMAIL_TEST_RESULTS_TEMPLATE.md`: manual result capture template.
- `manifest.json`: machine-readable index of this verification package.

## Readiness

- Microsoft mailbox operational verification: pending manual tests.
- Pumpkin real email sending: not ready.
- Public email display: under review.
- MX/DNS production confidence: pending manual verification.
- CMS/page import impact: no direct CMS change.

RollerRinkRentals.com remains paused.
