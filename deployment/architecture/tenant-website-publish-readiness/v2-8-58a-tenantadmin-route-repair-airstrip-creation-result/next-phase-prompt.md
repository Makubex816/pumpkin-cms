# V2.8.58B Next Phase Prompt

Approve V2.8.58B Airstrip Media RBAC Repair and Controlled Creation Resume only.

Carryforward:

- V2.8.58A implemented and deployed the source-supported TenantAdmin creation route.
- Pumpkin API deploy ID: `b74e7431-d13c-4313-9781-a72ee76e16c0`.
- Pumpkin API health and SuperAdmin login passed after deploy.
- Airstrip tenant remains absent.
- Airstrip media container was created, upload failed under RBAC/auth-mode login, and the container was deleted successfully.
- No Airstrip tenant/data records were created.

Required approval:

- Grant or confirm the operator has the minimum Azure Blob data-plane role needed to create container, upload blobs, read blob properties, and delete only the Airstrip target container/blobs if rollback is required.
- Resume from the retained secure file `.tmp/v2-8-58/secure/airstrip-controlled-creation.json`.

Boundaries:

- No additional Pumpkin API deploy unless new source changes are explicitly approved.
- No Admin UI/SWA deploy.
- No production cutover.
- No DNS/indexing.
- No contact POST or form submission.
- No storage keys/listKeys/SAS.
- No Ice mutation.
- Do not use a bulk add-all staging command.

