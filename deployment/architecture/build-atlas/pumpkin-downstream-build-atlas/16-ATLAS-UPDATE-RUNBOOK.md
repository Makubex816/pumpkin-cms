# Atlas Update Runbook

## At every major milestone

1. Validate the phase closeout and evidence references.
2. Append, never rewrite, the milestone result.
3. Update repository lineage with source and product SHAs.
4. Update capability dimensions individually.
5. Record decisions, risks, exceptions, and rollback points.
6. Update current state and resumption capsule.
7. Regenerate `atlas/ATLAS.md` and machine JSON.
8. Regenerate `generated/CHAT-PACK.md`.
9. Run package/schema/secret/cross-reference validation.
10. Build deterministic ZIP and checksum.

When the running phase returns, first preserve its raw closeout, then normalize it with `templates/current-build-closeout-ingestion.template.json`. Package assumptions must not overwrite the closeout.

Record upstream progress separately as source observed, source frozen, source qualified, slice integrated, slice runtime proven, and tenants reconciled.
