# Next Live Email Test Approval Required

Generated: 2026-06-06

Do not proceed without explicit approval.

Suggested approval:

```text
Approve Ice Graph live email delivery test only: switch func-ice-static-contact-20260605 from FORM_DELIVERY_MODE=no-email to FORM_DELIVERY_MODE=graph, submit exactly one safe approved /api/static-contact test payload, verify Microsoft Graph sendMail acceptance and mailbox receipt, then document the result and rollback path. No CMS writes, no MediaAsset writes, no Cloudflare changes, no static deployment, no production deployment, and Roller remains paused.
```

Expected live-test gates:

- switch only `FORM_DELIVERY_MODE`
- send exactly one approved test payload
- verify `sendMail` acceptance
- verify mailbox receipt
- rollback to `FORM_DELIVERY_MODE=no-email` if delivery fails or if the test window ends

