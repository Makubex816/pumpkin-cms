# Current build closeout ingestion checklist

1. Preserve the raw closeout unchanged in `evidence/raw/` or an approved external reference.
2. Validate the normalized JSON against `schemas/current-build-closeout.schema.json`.
3. Read back source commit, deployment ID, artifact hash, FormEntry, roles, isolation, and tenant modes from authoritative systems.
4. Resolve contradictions; never average or silently choose between sources.
5. Import the active Atlas with stable IDs and history.
6. Update current state, evidence index, resumption capsule, capability matrix, milestone ledger, Atlas changelog, chat pack, manifest, checksums, and ZIP.
7. Only then open the upstream freeze/qualification phase.
