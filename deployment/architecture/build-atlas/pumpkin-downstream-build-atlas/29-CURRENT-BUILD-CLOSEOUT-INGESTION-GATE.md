# Current Build Closeout Ingestion Gate

The running phase is the authoritative source for what the downstream product is doing now. Its closeout must be ingested before upstream reconciliation or chat migration.

## Required payload

### Source
- repository/path/remotes;
- branch/full head;
- commits/parentage;
- worktree/staged/untracked state;
- files changed and artifact hashes.

### Deployment/runtime
- application/environment;
- deployment IDs and source/artifact SHA;
- preflight/health/browser results;
- rollback target.

### Forms/leads
- final form mode per tenant;
- submission/correlation IDs;
- API result;
- exact FormEntry ID/readback;
- exact-one evidence;
- TenantAdmin/SuperAdmin visibility;
- cross-tenant denial;
- notification state independent of persistence;
- confirmation of no unapproved additional POST.

### Atlas/package
- Atlas path/schema/version/update;
- milestones;
- blockers/next gate;
- conflicts with package assumptions.

## Procedure

1. Preserve raw closeout unchanged.
2. Validate required fields.
3. Reconcile Git, deployment, and live readback.
4. Classify every mismatch.
5. Update active downstream and Atlas facts.
6. Recheck upstream.
7. Regenerate current state, Chat Pack, manifest, ZIP, checksum.
8. Only then load the package into the current system chat.

## Hard stops

Missing lineage, unexplained dirty state, ambiguous form persistence, tenant-isolation failure, unavailable claimed Atlas history, or package/current-state contradiction.
