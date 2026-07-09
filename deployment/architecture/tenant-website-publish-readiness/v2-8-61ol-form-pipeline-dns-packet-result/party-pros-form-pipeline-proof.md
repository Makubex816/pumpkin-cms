# Party Pros Form Pipeline Proof

Tenant: `party-pros-philadelphia`

FormDefinition: `party-pros-quote-request`

## Preview Runtime

GET-only checks on 2026-07-09:

| URL | Status | Notes |
| --- | ---: | --- |
| `https://app-pumpkin-starter-preview-centralus-001.azurewebsites.net/preview/party-pros-philadelphia` | 200 | Preview marker present |
| `https://app-pumpkin-starter-preview-centralus-001.azurewebsites.net/preview/party-pros-philadelphia/contact` | 200 | Form tag present; no HTML `action`; no `method=post`; preview-disabled marker present |
| `https://app-pumpkin-starter-preview-centralus-001.azurewebsites.net/preview/party-pros-philadelphia/service-areas` | 200 | Preview marker present |

Party Pros pages remain unpublished. No customer-facing Party Pros POST was run.

## FormDefinition

The V2.8.61OF backup contains one live Party Pros FormDefinition:

- id/formKey: `party-pros-quote-request`
- tenant/siteKey: `party-pros-philadelphia`
- status: `active`
- formType: `quote-or-booking-request`
- submitAction: `form-entry`
- runtimeSubmitPath: `/api/forms/party-pros-philadelphia/entries`
- required fields: `package`, `date`, `time`, `guests`, `name`, `phone`
- optional fields: `email`, `pickup`, `requests`
- hidden field: `tenant-id`
- consent: required, field `consent`
- spam protection honeypot: `company_website`

Notification and lead recipient refs are present in the backup, but their values were not printed.

## Source Support

The Pumpkin API submit alias exists at `apps/pumpkin-api/Program.cs:432`.

The starter adapter forwards runtime submits to the Pumpkin API at `apps/starter-app/src/app/api/forms/submit/[type]/route.ts:22` and supplies an Authorization header from config at `apps/starter-app/src/app/api/forms/submit/[type]/route.ts:27`.

Preview mode remains no-post through `apps/starter-app/src/components/PageRenderer.tsx:131` and `apps/starter-app/src/components/ContactFormBlock.tsx:48`.

## Controlled Boundary Check

At `2026-07-09T16:59:00.470Z`, a synthetic unauthenticated POST to:

```text
https://app-pumpkin-api-prod-centralus-001.azurewebsites.net/api/forms/party-pros-philadelphia/submit/party-pros-quote-request
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

Because Party Pros FormDefinition notification refs are configured and no approved test recipient/suppression path was provided, OL did not attempt a successful live POST.

## Result

Party Pros source pipeline: present.

Party Pros preview: no-post/disabled.

Party Pros authenticated live FormEntry creation/readback: blocked pending approved credentials and email-safety decision.
