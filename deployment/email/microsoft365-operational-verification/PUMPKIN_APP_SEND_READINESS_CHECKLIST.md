# Pumpkin App Send Readiness Checklist

Pumpkin is not ready to send real email through Microsoft 365 yet.

Current intended runtime posture:

- `EMAIL_PROVIDER_KEY=microsoft-365-exchange-online-plan-1`
- `EMAIL_SEND_MODE=dry-run`
- Real send disabled.

These are expected values or refs only. Do not commit real runtime secrets.

## Required Before Real Pumpkin Email Sending

- [ ] Microsoft app send method is chosen.
- [ ] Microsoft Graph or SMTP AUTH decision is made.
- [ ] Placeholder refs are configured outside repo in approved secure runtime configuration.
- [ ] Dry-run mode is switched intentionally only after approval.
- [ ] Test notification is sent in a controlled local or staging environment.
- [ ] Outbound email logging is enabled.
- [ ] Failure handling is validated.
- [ ] Suppression behavior is validated.
- [ ] Retry behavior is validated.
- [ ] Safe error logging is validated.
- [ ] No secrets are stored in repo.
- [ ] Lead notification template is reviewed.
- [ ] Autoresponder template is reviewed.
- [ ] Consent policy for autoresponder is approved.
- [ ] Pumpkin Lead Inbox remains the source of truth for form leads.

## Current Decision

- Pumpkin real email sending: not ready.
- Lead notifications: draft/dry-run only.
- Autoresponders: draft/dry-run only.
- Outbound log contract: documented, implementation readiness still required before real send.

Do not send real email from Pumpkin until all checks are complete and explicitly approved.
