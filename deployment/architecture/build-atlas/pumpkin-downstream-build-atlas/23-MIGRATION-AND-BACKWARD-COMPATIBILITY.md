# Migration and Backward Compatibility

## Block identity migration

1. Inventory every stored Page and fixture.
2. Detect missing/duplicate block IDs without mutation.
3. Derive deterministic IDs from stable page/block data; do not rely only on current index when reordering could alter identity.
4. Preserve type, content, unknown properties, order, and enabled state.
5. Produce before/after hashes excluding approved identity fields.
6. Apply through supported APIs with concurrency checks.
7. Read back and render every migrated page.

## Form CAPTCHA migration

- absent tenant setting defaults disabled until explicitly configured;
- absent per-form setting normalizes to `inherit` but cannot require an unconfigured provider;
- admin responses never expose secret values;
- public FormDefinition may contain only resolved public provider/site key/action;
- old clients continue when CAPTCHA is disabled;
- enable tenant by tenant under staged proof.

## Visual editor coexistence

Retain legacy/raw editor access or rollback during qualification. A visually edited page must remain readable by API/runtime and not depend on transient preview state.

## Atlas migration

Map existing Atlas IDs/history to v3 through an adapter. Preserve old paths or compatibility links until every consumer moves.
