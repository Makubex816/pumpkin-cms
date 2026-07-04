# Next Phase Prompt

Approve V2.8.60T Tenant Domain Binding Manager data model, read-only API shell, and SuperAdmin Admin UI shell only.

Carry forward V2.8.60S:

- Domain Binding Manager contract is complete.
- DomainBinding sidecar model is approved for implementation design.
- Manual DNS packet mode remains the baseline.
- Bluehost owner-assisted mode remains first provider mode for Airstrip.
- Airstrip first-use remains `airstrip-club-las-vegas` with default host `https://app-airstrip-prod-centralus-001.azurewebsites.net`.
- Target domain remains `airstripclublasvegas.com` and `www.airstripclublasvegas.com`.
- Existing Airstrip DNS packet remains referenced from `deployment/architecture/pumpkin-platform/PUMPKIN_AIRSTRIP_BLUEHOST_DNS_PACKET_V2_8_60.md`.

V2.8.60T approved scope:

- Add DomainBinding models in .NET and TypeScript.
- Add repository/data access contracts.
- Add GET-only SuperAdmin API routes for listing and reading DomainBinding records.
- Add SuperAdmin-only Admin UI navigation and read-only screens under `/dashboard/onboarding/domains`.
- Add tests for authorization, serialization, and state enum compatibility.
- Add documentation and runtime no-regression proof.

V2.8.60T not approved:

- No live DNS mutation.
- No Azure hostname binding.
- No deploy without separate approval.
- No Google Workspace email DNS activation.
- No CDN/Front Door.
- No indexing.
- No contact POST or form submission.
- No protected config reads.
- No provider credential handling.

