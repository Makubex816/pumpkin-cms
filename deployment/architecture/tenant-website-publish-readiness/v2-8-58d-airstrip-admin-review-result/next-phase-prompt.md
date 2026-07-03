# Next Phase Prompt

Approve V2.8.59 Airstrip isolated hybrid public preview proof only.

Use completed V2.8.58D as carryforward:

- Airstrip SuperAdmin/Admin UI review passed.
- Airstrip TenantAdmin own-tenant review passed.
- TenantAdmin denial for Onboarding and Users/Admins passed.
- Airstrip tenant isolation passed.
- 5 Airstrip CMS pages exist but are unpublished and need rebuild.
- 13 Airstrip public media URLs return HTTP 200.
- Active Airstrip theme exists.
- Airstrip FormDefinition `airstrip-reservation` is public-readable through Pumpkin API.
- Public Airstrip page API reads are blocked until page publish/readiness state is explicitly approved.
- Ice runtime no-regression passed.

Scope for V2.8.59:

- Isolated Airstrip hybrid preview proof only.
- Decide and approve the page publish/readiness step needed for isolated public page proof.
- Build or validate an isolated Airstrip preview without production cutover.
- Prove isolated preview routes, media rendering, theme application, and form definition wiring.
- Prove no Ice data bleed in isolated preview.
- No production cutover.
- No DNS/custom-domain mutation.
- No indexing/Search Console/URL inspection/sitemap indexing submission.
- No contact POST.
- No form submission unless separately approved in the same prompt.
- No storage keys/listKeys/SAS, connection string generation, or Key Vault secret query.

Required outputs:

- Isolated Airstrip preview proof.
- Public page readiness readback after approved isolated-only publish/readiness action, if approved.
- Media/theme/form wiring proof.
- Tenant isolation proof.
- Exact blocker if isolated proof cannot close.
