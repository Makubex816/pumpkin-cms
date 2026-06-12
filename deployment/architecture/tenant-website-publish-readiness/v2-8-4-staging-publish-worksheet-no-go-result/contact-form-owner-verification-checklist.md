# Contact Form Owner Verification Checklist

Status: active no-go until owner verification is complete.

Required owner decisions:

- [ ] Confirm whether staging should use a real staging-safe static form endpoint or intentionally show the static endpoint limitation.
- [ ] Confirm the endpoint URL is public-only and contains no secret material.
- [ ] Confirm no production email or CRM side effects occur during staging tests unless explicitly approved.
- [ ] Confirm allowed origins include only approved staging/production domains.
- [ ] Confirm cache bypass is planned for form endpoint traffic.
- [ ] Confirm spam/rate-limit controls are documented.
- [ ] Confirm Lead Inbox or email delivery expectations are documented.
- [ ] Confirm form success/failure copy is acceptable for staging.

V2.8.4 did not submit test forms and did not perform live HTTP checks.

