# CMS Visual Persistence Decision Packet

## Decision

Keep the currently proven Party Pros runtime fixture in service temporarily. Do not mutate CMS records in OSI. Persist the accepted visual/catalog/link graph into authoritative CMS records in a later separately approved phase.

## Rationale

The fixture currently provides a stable live baseline with 242 routes, the accepted OSG visual treatment, 214 catalog items, dedicated category/event/item routes, required consent, and proven form behavior. Replacing it during final form closeout would add unrelated mutation and regression risk.

The fixture is not a desirable permanent source of truth because Admin editing and package recompilation cannot yet reproduce the entire accepted graph from CMS records alone.

## Later Persistence Scope

1. Back up and read back current Party Pros page, theme, FormDefinition, navigation, and media-reference records.
2. Reconcile existing records with the accepted 242-route fixture; do not blindly import duplicates.
3. Persist structured catalog/category/event/item pages, metadata, menu data, theme tokens, FormDefinition binding, and public media references.
4. Update the package compiler and intake contract so catalog and item link graphs are reproducible.
5. Require a visual-reference package and safe link/image graph inventory for future tenants when a reference exists.
6. Prove CMS-rendered route, visual, responsive, media, form, and tenant-isolation parity.
7. Switch away from the fixture only after backup, readback, rollback proof, and owner acceptance.

## OSI Boundary

- Party Pros CMS mutations: 0.
- Fixture output mutations: 0.
- Package compiler mutations: 0.
- Current live fixture retained: yes.

This deferred persistence work is tracked technical debt, not a blocker to final Party Pros live readiness or progression to the next tenant.

