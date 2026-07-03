# Next Phase Prompt

Approve V2.8.60 Airstrip owner visual review, isolated preview acceptance, and production cutover decision packet only.

Use completed V2.8.59 as carryforward:

- Airstrip public page API reads return HTTP 200 for all 5 expected page slugs.
- Airstrip FormDefinition `airstrip-reservation`, theme, and sitemap reads return HTTP 200.
- Airstrip isolated preview app exists at `https://app-airstrip-preview-isolated-centralus-001.azurewebsites.net`.
- Key isolated preview routes return HTTP 200.
- Browser diagnostics show zero console errors, zero failed requests, zero bad responses, and zero missing image assets.
- Screenshots exist outside repo under `C:\Users\User\Desktop\PumpkinCMS\visual-review\v2-8-59-airstrip-isolated-preview\`.
- Tenant isolation passed.
- Ice runtime no-regression passed.
- No production cutover has occurred.

Scope for V2.8.60:

- Owner visual review of isolated Airstrip preview.
- Confirm whether isolated preview is accepted as production cutover candidate.
- Build production cutover decision packet.
- No production deploy unless explicitly approved.
- No DNS/custom-domain mutation unless explicitly approved.
- No indexing/Search Console/URL inspection/sitemap indexing submission unless explicitly approved after DNS/cutover.
- No contact POST or form submission unless explicitly approved.
- No storage keys/listKeys/SAS, connection string generation, or Key Vault secret query.

Required outputs:

- Owner visual review result.
- Cutover go/no-go decision.
- If go: exact separate production cutover approval prompt.
- If no-go: exact blocker list and repair scope.
