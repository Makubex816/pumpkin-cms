# Next Phase Prompt

Approve V2.8.60U DomainBinding Admin UI read-only/control shell only.

Carry forward V2.8.60T:

- DomainBinding backend/API/storage exists.
- Pumpkin API production has V2.8.60T deployed.
- Airstrip DomainBinding exists in pending DNS state.
- DNS packet generation matches V2.8.60 Airstrip packet.
- Read-only DNS validation remains `pending`.
- TenantAdmin denial is proven.

Approved V2.8.60U scope:

- Add SuperAdmin-only Admin UI route `/dashboard/onboarding/domains`.
- Add Admin API client methods for DomainBinding list/read/create/update/generate DNS packet/validate DNS.
- Add DomainBinding overview and detail screens.
- Display Airstrip pending DNS state.
- Display DNS packet and read-only validation results.
- Keep TenantAdmin hidden and server-denied.

Not approved in V2.8.60U:

- No Bluehost DNS mutation.
- No Azure custom-domain binding.
- No nameserver changes.
- No Azure DNS zone creation.
- No Google Workspace email DNS activation.
- No CDN/Front Door.
- No indexing.
- No contact POST or form submission.
- No media or Ice mutation.

