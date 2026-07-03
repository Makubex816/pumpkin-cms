# V2.8.58A Next Phase Prompt

Approve V2.8.58A TenantAdmin Provisioning Path Repair/Approval only.

Goal: unblock V2.8.58 Airstrip controlled tenant creation by approving exactly one source-supported, auditable way to create the required Airstrip TenantAdmin before any Airstrip media upload or tenant creation resumes.

Carryforward:

- V2.8.58 stopped before mutation.
- Airstrip tenant was absent.
- SuperAdmin login/verify and tenant list readback passed.
- Normalized package validation passed.
- Required blocker: current live Pumpkin API exposes no user/TenantAdmin create/update route.

Approved options to choose from in V2.8.58A:

1. Implement a protected SuperAdmin-only TenantAdmin/user provisioning endpoint in Pumpkin API, with tests, deploy approval, and live proof; or
2. Approve a one-time secure data-plane seed/repair path with explicit provider credentials supplied only in a new ignored secure file.

Hard boundaries to keep:

- Do not create the Airstrip tenant until TenantAdmin creation and login proof are source-supported.
- Do not upload Airstrip media until the creation chain can complete.
- Do not use storage keys/listKeys/SAS.
- Do not print or write secrets.
- Do not mutate Ice data.
- Do not deploy unless the chosen option explicitly approves the Pumpkin API deploy.
- Do not use a bulk add-all staging command.

Resume V2.8.58 only after V2.8.58A proves a TenantAdmin provisioning path and preserves the security boundary.
