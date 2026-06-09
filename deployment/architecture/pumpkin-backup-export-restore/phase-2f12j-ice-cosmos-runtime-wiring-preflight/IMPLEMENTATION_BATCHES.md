# Implementation Batches

These batches are proposed for the next implementation phase. They are not executed in Phase 2F-12J.

## Batch 1: Runtime Profile Options

- Add non-secret runtime profile options.
- Add explicit profile names for local, fake, live-readonly, and runtime-cosmos-future.
- Default production write behavior to disabled.
- Add tests proving unknown or missing profiles fail closed.

## Batch 2: Provider Resolver Bridge

- Wire the existing provider metadata resolver into runtime profile selection.
- Keep Cosmos profile classified as future target unless an explicit switch gate is true.
- Add redaction and no-secret-field tests.

## Batch 3: Disabled Cosmos Provider Adapter

- Add a disabled adapter shell for future Cosmos runtime use.
- Do not connect to Cosmos or read data in this batch.
- Return explicit disabled-profile diagnostics.
- Add tests proving the adapter cannot perform writes.

## Batch 4: Metadata Endpoint Verification Harness

- Add a GET-only verification path for approved future checks.
- Verify authorization requirements.
- Verify Ice maps to the provisioned future target.
- Verify runtime switch and seed flags remain false.

## Batch 5: Runtime Wiring Result Package

- Create a result package after implementation.
- Include config-name inventory, profile-selection evidence, test output, and next seed/migration preflight prompt.

