# Validation Gates

## Phase 2F-12J Completion Gates

- Planning package exists.
- Root report exists.
- Manifest JSON parses.
- No secret-bearing values are included.
- No runtime switch is approved.
- No data seed or migration is approved.
- No external system mutation occurred.

## Next Implementation Gates

The next implementation phase must prove:

- Runtime profile defaults fail closed.
- Ice remains classified as a provisioned future Cosmos target.
- Metadata endpoint output remains non-secret.
- Provider resolver does not select Cosmos as active runtime storage without an explicit switch gate.
- `local-dev` and `fake-provider` cannot reach Azure.
- `live-readonly` cannot perform writes, exports, or blob downloads.
- Disabled Cosmos adapter cannot read or write data.

## Later Read-Only Verification Gates

Before any runtime switch planning:

- GET-only metadata endpoint verification succeeds.
- Authorization is confirmed.
- Tenant/site/environment mapping is correct.
- Runtime switch flag remains false.
- Data seed flag remains false.
- Backup proof requirements are documented.

## Production Switch Gates

Production switch planning remains blocked until:

- Runtime wiring is implemented and verified.
- Seed/migration is approved and completed.
- Post-seed readback is complete.
- Backup and restore validation are complete.
- Owner approves a production switch preflight.

