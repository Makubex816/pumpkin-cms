# Next-phase prompt

## Immediate next safe gate after blocked CUR-20

Use this only to unblock CUR-20. Do not start UP-20 or IDM-40 until the active Build Atlas is found or the owner explicitly supplies it.

```text
TASK: DISC-10 / CUR-20 unblock — Locate and Reconcile the Active Build Atlas

Repository:
C:\Users\User\Desktop\PumpkinCMS\pumpkin-cms

Branch:
feature/admin-page-editor-import-export

Current CUR-20 status:
blocked_active_downstream_or_atlas_not_identified

Objective:
Locate the actual active Build Atlas for the active downstream product, prove its authority, back it up byte-for-byte outside the repository or in the existing approved Atlas backup location, validate its schema/checksums/update tooling, and then resume CUR-20 reconciliation using the preserved CUR-20 result package.

Authoritative CUR-20 evidence:
deployment/architecture/platform-closeout/cur-20-current-build-closeout-ingestion-result/

Required inputs:
- committed CRSTUR closeout at deployment/architecture/identity/v2-8-63crstu-readiness-identity-activation-result/
- supplied Atlas v3 bridge ZIP with SHA-256 065523926d4005370b45de9778193b8249ef567454c66c30d32b4164eaa3b57c
- supplied working-memory v0.9.0-precloseout ZIP with SHA-256 1ff1a4ab9cf8657df7566df8463e770dcc07e2a94fa6d47817ab1410264b49f9

Do not:
- treat the supplied Atlas v3 bridge as active merely because it is available;
- create a competing OPS-010 registry;
- overwrite unseen Atlas history;
- mutate Azure, tenants, users, forms, DNS, indexing, Airstrip runtime, payments, or upstream Git;
- stage unrelated dirty worktree files.

Acceptance:
- active Atlas path, schema, version, stable IDs, manifest, update tooling, validation tooling, and authority are proven; or
- the absence/conflict is classified with a new hard-stop result.
```

After that succeeds, use `UP-20_RECHECK_AND_FREEZE_EXACT_UPSTREAM_SOURCE_PROMPT.md`. Preserve `IDM-40_MUTABLE_TENANT_SLUG_ACTIVATION_PROMPT.md` as the downstream continuation prompt; do not silently delete or deprioritize it.

