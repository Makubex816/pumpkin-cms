# Next Phase Prompt

Approve V2.8.32S only: repair the live Pumpkin API provider-store configuration blocker carried forward from V2.8.32R.

Scope:

- Use a new ignored secure handoff file containing only the approved production provider-store values required by source.
- Lock Azure subscription to `ff887def-fd83-4a19-9298-13d4b1687873`.
- Do not list/show appsettings.
- Do not print or write provider secrets.
- Set only source-discovered provider-store appsettings required to make the login/readback path usable.
- Run Pumpkin API health and require `providerConfigured:true` or an equivalent source-supported readiness signal.
- Run live Admin login.
- Use the returned bearer token only in memory.
- Run authenticated Admin FormEntry readback preflight.
- Only if readback preflight returns 2xx, run static contact preflights and submit exactly one synthetic non-PII production contact POST.
- Read back the returned entry ID or trace through the authenticated Admin route.

Hard stops:

- No deploy/redeploy.
- No appsettings list/show.
- No protected config read except the new approved secure file.
- No Key Vault secret query.
- No keys/listKeys.
- No DNS/indexing.
- No provider inbox login.
- No more than one production contact POST.

