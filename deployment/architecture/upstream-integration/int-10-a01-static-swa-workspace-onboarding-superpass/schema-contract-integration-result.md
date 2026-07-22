# Schema and generated-contract integration result

Result: additive integration complete with generated-output hold.

Committed:

- `schemas/blocks/` canonical frozen-upstream block schema catalog.
- `scripts/test-block-contracts.mjs`.
- `scripts/generate-block-contracts.mjs`.
- `apps/pumpkin-api.Tests/Fixtures/block-contracts.generated.json`.

Two clean roots validated 16 generated block fixtures against the schemas. Checked-in downstream generated model/dist rewrites were not overwritten; generated-output adaptation remains controlled by the committed generator and future exact review.
