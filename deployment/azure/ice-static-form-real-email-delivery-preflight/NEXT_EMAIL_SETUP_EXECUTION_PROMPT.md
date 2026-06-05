# Next Email Setup Execution Prompt

Generated: 2026-06-05

Use this only after the user explicitly approves Microsoft 365/email setup and endpoint code changes.

```text
Approve Ice contact form Microsoft 365 Graph email setup and endpoint implementation only: implement the static form endpoint Graph delivery mode behind a dry-run rollback switch, configure only the approved server-side placeholders after Microsoft 365 admin setup is approved, verify with mocked/local tests first, and prepare one approved live test email submission plan. Do not send email until the separate live-test step is explicitly approved. No CMS writes, no MediaAsset writes, no Cloudflare changes, no static deployment, no production DNS changes, and Roller remains paused.
```

## Future Live Test Prompt

Use this only after endpoint code, Microsoft 365 setup, and Azure app settings are approved and complete.

```text
Approve Ice contact form one-message live email verification only: submit exactly one approved static contact test payload through the production email-enabled endpoint, verify receipt at the approved recipient, verify invalid payloads do not send, rerun strict validators, and document the result. No additional Microsoft 365 changes, no Azure redeploy, no CMS writes, no MediaAsset writes, no Cloudflare changes, no static deployment, no DNS changes, and Roller remains paused.
```

