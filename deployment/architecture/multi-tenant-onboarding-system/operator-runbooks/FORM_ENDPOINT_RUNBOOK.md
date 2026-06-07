# Form Endpoint Runbook

1. Review form intake.
2. Confirm recipient and mailbox owner.
3. Confirm consent/notice status.
4. Confirm delivery mode.
5. Run safe form validators.
6. Request form endpoint approval for any external settings or tests.
7. Use safe `OPTIONS` and invalid-payload checks where possible.
8. Send a valid test only if explicitly approved.
9. Confirm inbox behavior with owner.
10. Document rollback mode.

Do not send email or change Microsoft 365 without approval.

