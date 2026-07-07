# Models Packages Compatibility Audit

Status: model/package compatibility review required.

Upstream model additions and changes:

- `apps/pumpkin-net-models/Models/FormBlock.cs`
- `apps/pumpkin-net-models/Models/FormDefinition.cs`
- `apps/pumpkin-net-models/Models/FormEntry.cs`
- `apps/pumpkin-net-models/Models/Theme.cs`
- `packages/pumpkin-ts-models/src/models/FormDefinition.ts`
- `packages/pumpkin-ts-models/src/models/FormEntry.ts`
- `packages/pumpkin-ts-models/src/models/Theme.ts`
- `packages/pumpkin-ts-models/src/models/InteractionBlocks.ts`
- `packages/pumpkin-block-views/src/defaults/form.ts`
- `packages/pumpkin-block-views/src/views/FormBlockView.tsx`

Compatibility considerations:

- Current active repo already has FormDefinition/FormEntry contracts and Admin UI dependencies.
- Upstream may add fields and validation behavior that are useful, but field optionality and defaulting need review before database writes.
- Current production Cosmos containers and stored documents must not be assumed compatible without a migration/readback plan.
- The new `FormBlockView` can be adopted as a rendering capability after the TS model and page block discriminators are reconciled.

Adoption position:

- Adopt package ideas and tests.
- Adapt model fields behind contract tests.
- Defer production data writes until read/serialize/backfill behavior is validated.
