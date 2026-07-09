# Next Phase Prompt

Approve V2.8.61OF Party Pros backup exporter and runtime preview planning only.

Carry forward:

- Party Pros tenant `party-pros-philadelphia` exists and is active.
- TenantAdmin login and tenant scope were reproved in V2.8.61OE.
- Media container `party-pros-philadelphia-media` has 627 readable blobs under `party-pros-philadelphia/`.
- MediaAsset records read back 627/627.
- FormDefinition `party-pros-quote-request` exists.
- Theme `party-pros-orange-slate-v1` exists and is active.
- Pages `home`, `contact`, and `service-areas` exist and are unpublished.
- Current Backup Center live generator is Ice-specific and must be adapted before any Party Pros backup claim.
- Current publish/snapshot profiles do not include Party Pros.

Approved scope for V2.8.61OF should be planning/proof only unless separately expanded:

- design tenant-parameterized Backup Center export for Party Pros;
- design Party Pros preview profile path;
- optionally run local-only non-public starter-app or snapshot feasibility checks if no deploy, publish, DNS, POST, Airstrip, or Ice mutation is needed.

Still not approved:

- deploy;
- DNS/custom-domain/nameserver action;
- page publish;
- contact POST;
- form submission;
- customer-facing POST proof;
- media upload/delete;
- Ice mutation;
- Airstrip action;
- storage keys/listKeys/SAS;
- protected config read;
- backup bundle staging into Git.

