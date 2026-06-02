# Ice Homepage Phase 8N Contract Persistence Repair

This package documents the non-mutating repair for the Phase 8N homepage contract persistence issue.

Scope:
- Primary site: IceSkatingRinkRentals.com.
- Route in scope: `/` only.
- CMS writes performed in this repair run: none.
- Theme, MediaAsset, static output, deployment, DNS, email, and provider changes: none.
- RollerRinkRentals.com remains paused.

The prior Phase 8N overwrite succeeded as a local draft update, but readback showed production homepage fields were stripped by the .NET Page/block contract boundary. This repair updates the shared contracts and validators so future draft overwrite attempts can preserve production renderer variants, MediaAsset-backed media metadata, and domain email display-policy metadata.

Key outputs:
- `phase8n-import-preflight-after-contract-repair.json`
- `phase8n-readback-persistence-comparison.json`
- `STRIPPED_FIELDS_AUDIT.md`
- `CONTRACT_REPAIR_SUMMARY.md`
- `ROUNDTRIP_VALIDATION.md`
- `NEXT_REIMPORT_PLAN.md`

