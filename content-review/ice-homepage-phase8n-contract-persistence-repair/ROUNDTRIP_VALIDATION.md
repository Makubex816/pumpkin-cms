# Round-Trip Validation

Candidate validated:
- `content-review/ice-homepage-phase8n-crm-scaffold-validated/HOMEPAGE_PHASE8N_NORMALIZED_CANDIDATE.json`

Validation results:
- JSON parse: passed.
- .NET Page/block contract: passed.
- .NET semantic round trip: passed.
- Production field persistence: passed.
- Import preflight shape/local draft import: passed.
- Existing active readback comparison: drift detected, expected for the pre-repair CMS write.

Important distinction:
- The repaired contract has been validated against the Phase 8N candidate.
- The old CMS readback remains a pre-repair artifact because this run did not perform a CMS rewrite.

Artifacts:
- `phase8n-import-preflight-after-contract-repair.json`
- `phase8n-readback-persistence-comparison.json`

Known validation note:
- Direct `dotnet build apps/pumpkin-net-models/pumpkin-net-models.csproj -o <temp>` hit a local `VBCSCompiler` lock on the repo `obj` DLL.
- The contract tool build to temp succeeded and compiled `pumpkin-net-models`, `pumpkin-api`, and `Pumpkin.PageContractTool`.

