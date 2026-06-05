# Ice Static Form Real Email Delivery Preflight

Generated: 2026-06-05

## Scope

This package documents the future path from the deployed no-email Ice static form endpoint to real email delivery readiness.

No email was sent. No Microsoft 365 settings were changed. No Azure app settings were changed. No endpoint redeploy occurred. No CMS writes, MediaAsset writes, Cloudflare changes, static deployment, protected config reads, or Roller work occurred.

## Current Endpoint

```text
https://func-ice-static-contact-20260605.azurewebsites.net/api/static-contact
```

Current mode:

```text
STATIC_FORM_FORWARD_MODE=dry-run
```

The endpoint is suitable for no-email validator wiring, not real contact form production readiness.

## Recommendation

Use Microsoft Graph `sendMail` behind the existing Azure Function endpoint, with the sender identity `contact@iceskatingrinkrentals.com` and mailbox access scoped through Exchange Online RBAC for Applications where available.

Keep dry-run/no-email mode as the first rollback switch.

## Files

- `CURRENT_NO_EMAIL_ENDPOINT_STATE.md`
- `EMAIL_DELIVERY_OPTIONS.md`
- `RECOMMENDED_EMAIL_DELIVERY_PATH.md`
- `REQUIRED_MICROSOFT_365_OR_EMAIL_SETUP.md`
- `REQUIRED_APP_SETTINGS_PLACEHOLDERS.md`
- `ENDPOINT_CODE_CHANGE_REVIEW.md`
- `REAL_EMAIL_VERIFICATION_PLAN.md`
- `ROLLBACK_AND_DISABLE_PLAN.md`
- `APPROVAL_REQUIRED_BEFORE_EMAIL_SETUP.md`
- `NEXT_EMAIL_SETUP_EXECUTION_PROMPT.md`
- `manifest.json`

## Readiness

Contact form production readiness remains:

```text
no
```

Real email delivery readiness:

```text
pending explicit approval
```

