# Downstream Integration Policy

## Preserve product truth

1. Preserve the active downstream branch and deployments before upstream intake.
2. Never substitute public historical lineage for active source.
3. Prefer qualified upstream behavior for shared primitives.
4. Add product behavior through adapters, orchestration, configuration, and separate control-plane modules where possible.
5. Track downstream shared-core patches in a vendor patch queue and reevaluate them at every intake.

## Integration branch requirements

- exact parent SHAs recorded;
- one subsystem/slice per intentional commit;
- no broad staging;
- no private repository source copied into public artifacts;
- clean-room build after every contract-changing slice;
- rollback point before data migration;
- result manifest and Atlas update.

## Conflict resolution precedence

```text
security and tenant isolation
→ authoritative persistence and data ownership
→ backward compatibility
→ shared upstream contract
→ downstream product requirements
→ UI convenience
```

## Seamless downstream definition

Seamless does not mean no code changes. It means lineage is explicit, contracts are compatible or versioned, migrations are deterministic, tenant data and roles remain isolated, upstream intake is repeatable, product-only capabilities are preserved, and release/rollback are independently reproducible.
