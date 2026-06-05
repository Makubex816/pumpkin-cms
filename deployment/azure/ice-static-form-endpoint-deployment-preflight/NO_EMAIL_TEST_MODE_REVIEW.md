# No-Email Test Mode Review

Generated: 2026-06-05

## Current Package Behavior

The hardened endpoint package does not send email directly.

Forwarding modes:

```text
STATIC_FORM_FORWARD_MODE=dry-run
STATIC_FORM_FORWARD_MODE=pumpkin-api
```

`dry-run`:

- validates the request
- sanitizes payload data
- builds the `FormEntry` shape
- returns success without forwarding to Pumpkin API
- sends no email

`pumpkin-api`:

- validates the request
- sanitizes payload data
- forwards the entry to Pumpkin API `/api/forms/{tenantId}/entries`
- uses a server-side site API key
- sends no email from this package

## Safe Verification Sequence

Future deployment testing can remain no-email:

1. Run local `npm run check` and `npm test`.
2. Run deployed endpoint `OPTIONS` checks.
3. Run deployed endpoint negative validation checks.
4. Optionally run deployed `dry-run` validation-only POST checks.
5. After secret approval, switch to `pumpkin-api` mode and verify `FormEntry` persistence.
6. Keep notification/email work disabled until separate Microsoft 365/email approval.

## What Dry-Run Can Prove

Dry-run can prove:

- endpoint is reachable
- CORS behavior works
- payload shape is accepted
- validation rejects bad input
- routing refs are mapped safely
- public response shape is safe

Dry-run cannot prove:

- Pumpkin API persistence
- Lead Inbox visibility
- backend credential correctness
- production form readiness

## Current Conclusion

No code change is required to support a no-email verification path.

Production/static readiness still requires a deployed HTTPS endpoint and backend persistence verification before `STATIC_FORM_ENDPOINT_VERIFIED=true`.
