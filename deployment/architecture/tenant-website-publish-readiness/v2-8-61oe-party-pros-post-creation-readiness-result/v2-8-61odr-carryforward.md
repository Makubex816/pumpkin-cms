# V2.8.61ODR Carryforward

V2.8.61ODR is committed:

`0d0cbca0 Resume Party Pros import after form block repair`

Carryforward accepted by V2.8.61OE:

- Party Pros tenant `party-pros-philadelphia` exists.
- TenantAdmin login and tenant scope were proved in ODR.
- Media blobs remained readable: 627/627.
- MediaAsset records were created and read back: 627/627.
- `contact` and `service-areas` pages were created and read back, unpublished.
- FormDefinition `party-pros-quote-request` exists.
- Theme `party-pros-orange-slate-v1` exists and is active.
- Ice counts stayed unchanged.
- Runtime no-regression passed in ODR.
- No deploy, DNS, contact POST, form submission, customer-facing POST, Airstrip action, Ice mutation, storage keys/listKeys/SAS, appsetting mutation, or auth value printing occurred.

V2.8.61OE preserved that state and performed only approved read-only verification plus login/scope proof.

