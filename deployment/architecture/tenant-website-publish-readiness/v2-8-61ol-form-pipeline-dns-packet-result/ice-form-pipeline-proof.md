# Ice Form Pipeline Proof

Tenant: `ice-rink-rentals`

## Public Runtime

GET-only checks on 2026-07-09:

| URL | Status | Notes |
| --- | ---: | --- |
| `https://iceskatingrinkrentals.com/` | 200 | No form tag in HTML scan |
| `https://iceskatingrinkrentals.com/contact` | 200 | Form tag present; no HTML `action`; no `method=post`; one submit button |
| `https://iceskatingrinkrentals.com/service-areas` | 200 | No form tag in HTML scan |
| `https://iceskatingrinkrentals.com/api/static-contact-health` | 200 | Static contact health route only |
| `https://www.iceskatingrinkrentals.com/` | 200 | No form tag in HTML scan |
| `https://www.iceskatingrinkrentals.com/contact` | 200 | Form tag present; no HTML `action`; no `method=post`; one submit button |
| `https://www.iceskatingrinkrentals.com/service-areas` | 200 | No form tag in HTML scan |
| `https://www.iceskatingrinkrentals.com/api/static-contact-health` | 200 | Static contact health route only |

## Source Support

The Pumpkin API tenant submit alias exists at `POST /api/forms/{tenantId}/submit/{type}`.

The default Ice quote definition is source-defined in `packages/pumpkin-ts-models/src/forms.ts:274`, with consent and honeypot fields at `packages/pumpkin-ts-models/src/forms.ts:319` and `packages/pumpkin-ts-models/src/forms.ts:320`.

The submit guard requires Ice/default quote fields at `apps/pumpkin-api/Services/FormSubmissionGuard.cs:37`.

## Controlled Boundary Check

At `2026-07-09T16:59:00.470Z`, a synthetic unauthenticated POST to:

```text
https://app-pumpkin-api-prod-centralus-001.azurewebsites.net/api/forms/ice-rink-rentals/submit/quote-request
```

returned:

```text
HTTP 400
"API key is required"
Location header: absent
```

This stopped before FormEntry creation and before any notification path.

## Blocker

Authenticated end-to-end proof was not run because OL did not include an approved tenant API key handoff or approved Admin/SuperAdmin readback credential handoff.

The live static contact endpoint was not posted because external email delivery/suppression was not approved for OL.

## Result

Ice source pipeline: present.

Ice authenticated live FormEntry creation/readback: blocked pending approved credentials and email-safety decision.
