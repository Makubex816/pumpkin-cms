# Next Phase Prompt

Approve V2.8.61OSC Party Pros Media-Repaired Preview Acceptance and Form E2E Retry Decision.

Carryforward:

- V2.8.61OSB repaired Party Pros custom-domain image/media rendering on the shared starter host.
- Party Pros custom-domain routes return HTTP 200:
  - `https://partyrentalphiladelphia.com/`
  - `https://partyrentalphiladelphia.com/contact`
  - `https://partyrentalphiladelphia.com/service-areas`
  - `https://www.partyrentalphiladelphia.com/`
  - `https://www.partyrentalphiladelphia.com/contact`
  - `https://www.partyrentalphiladelphia.com/service-areas`
- Rendered pages now contain tenant-scoped public blob image URLs.
- Representative image URLs return HTTP 200.
- Browser responsive proof passed across 375, 390, 768, and 1366 viewports.
- Forms remained no-post/disabled.
- Runtime no-regression passed 23/23 GET-only checks.
- Airstrip stayed untouched.
- V2.8.61OSRA form E2E remains blocked by missing secure handoff values.

Next decision:

- Owner should visually review the repaired Party Pros custom-domain pages.
- If accepted, decide whether to resume form E2E with a corrected secure handoff.
- If not accepted, identify exact visual/content/media corrections before any form E2E retry.

Still not approved unless explicitly granted in the next phase:

- no form submission;
- no contact POST;
- no customer-facing POST proof;
- no FormEntry mutation;
- no Party Pros CMS mutation;
- no media upload/delete/regeneration;
- no storage keys/listKeys/SAS;
- no Airstrip probe/action;
- no DNS/registrar/nameserver action;
- no hostname binding or TLS action;
- no Pumpkin API deploy;
- no Admin UI deploy;
- no Ice deploy;
- no appsetting mutation;
- no secret/token/cookie/API key printing;
- no `.tmp`, screenshot, deployment ZIP, backup, hardcopy, package-output, `node_modules`, or `.next` staging;
- no `git add -A`.

If form E2E is approved next, require a corrected ignored secure handoff with:

- `operatorReadbackAuth.headerName`;
- non-empty `operatorReadbackAuth.headerValue`;
- `runtimeSubmitAuth.tenantIdAppSettingName`;
- `runtimeSubmitAuth.tenantIdAppSettingValue`;
- `runtimeSubmitAuth.apiKeyAppSettingName`;
- non-empty `runtimeSubmitAuth.apiKeyValue`.

Do not print secret values.
