# Real Email Verification Plan

Generated: 2026-06-05

No real email was sent in this preflight.

## Future Ordered Verification

1. Approve Microsoft 365/email setup.
2. Approve endpoint code changes for Graph delivery.
3. Approve Azure Function app setting changes or Key Vault references.
4. Approve endpoint redeployment.
5. Confirm `contact@iceskatingrinkrentals.com` sender mailbox exists and is approved.
6. Confirm the recipient for `ICE_RINK_RENTALS_LEAD_RECIPIENT` is approved.
7. Confirm the sending app identity is scoped to the sender mailbox.
8. Run local package checks and mocked Graph tests.
9. Deploy the updated endpoint after approval.
10. Keep delivery mode in dry-run first and repeat no-email endpoint checks.
11. Switch to Graph delivery only after approval.
12. Submit exactly one approved test payload.
13. Confirm Graph returns the expected acceptance status.
14. Confirm the approved recipient receives the email.
15. Confirm the email body contains only sanitized expected fields.
16. Confirm reply-to behavior is approved and correct.
17. Confirm invalid payloads still reject without email.
18. Confirm public responses do not expose secrets, recipients, tokens, or Graph error details.
19. Rerun Ice static export with endpoint env set for the approved production email context.
20. Rerun strict static output and staging package validators.

## Validator Transition

Current validator state:

```text
STATIC_FORM_ENDPOINT_VERIFIED=true only for local/staging no-email validation context
```

Future production email verified state may be considered only after:

- real email delivery code is deployed
- Microsoft 365/mailbox scope is approved and configured
- one approved live test email is received
- invalid payload no-send checks pass
- strict validators pass with the endpoint URL
- no secret or recipient data is exposed in static output

Until then:

```text
contact form production readiness=no
```

## Acceptance Note

Microsoft Graph `sendMail` returning `202 Accepted` is necessary but not sufficient. The gate requires actual approved recipient receipt because Graph acceptance does not prove final delivery.

