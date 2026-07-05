# Backup Coverage Gap Matrix

| Domain | Current Coverage | Target Coverage | Gap | Priority |
| --- | --- | --- | --- | --- |
| Tenant | Covered redacted in V2.8.52A | Full tenant record with secret fields redacted | Add versioned restore mapping | P1 |
| Users | Partial current actor redacted | Full user inventory plus reset/reseed plan | Identity restore model missing | P0 |
| Pages | Covered | Full records plus route proof | Add schema version and diff manifest | P1 |
| MediaAsset records | Covered | Full records plus blob map | Add restore mapping | P1 |
| Media blobs | Covered for Ice proof | Full copy with checksums for every asset | Promote to repeatable per-tenant job | P0 |
| Themes | Covered | Full active and historical tenant themes if present | Add active-theme restore rule | P1 |
| FormDefinitions | Covered | Full tenant form definitions | Add form endpoint binding check | P1 |
| FormEntries | Covered protected | Protected PII export with privacy controls | Restore approval and retention policy missing | P0 |
| ImportRuns | Covered | Full audit records | Add package source references | P2 |
| PublishRuns | Covered | Full audit records plus artifact references | Add build/deploy artifact links | P1 |
| DomainBinding | Source exists, not V2.8.52A bundle coverage | Required export of binding, DNS packet, validation state | Add to backup exporter and restore planner | P0 |
| Original frontend package | Not in V2.8.52A bundle | Copy or reference original upload | Need source package registry | P0 |
| Normalized Pumpkin package | Summary only | Copy normalized package where available | Need package registry and checksum | P0 |
| Source overlays/patches | Not generally captured | Copy overlay files such as Airstrip responsive repair | Need patch registry | P0 |
| Runtime/build artifacts | Metadata-level only | Include artifact metadata and safe rebuild inputs, optionally files | Need policy for artifact storage | P1 |
| Resource bindings | Summary only | Azure, Cosmos, Storage, Admin UI, API, SWA/App Service, monitoring map | Need structured binding contract | P1 |
| Secrets | Excluded by design | Outside-repo hardcopy references and missing-secret report | Need standard secret reference schema | P0 |
| Checksums | Proven | Full checksum manifest for all files | Promote into service job | P1 |
| Restore runbook | Proven planning level | Generated per backup with exact gaps | Add automated restore checklist writer | P1 |

