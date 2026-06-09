# Provider Selection Flow

## Runtime Profile Resolution

1. Load fixture-backed provider metadata, if supplied.
2. Validate provider metadata against the non-secret provider contract.
3. Classify the provider state.
4. Select or honor the requested runtime profile.
5. Build guard decisions for live database export, fake complete export, runtime switch, and production writes.
6. Return a non-secret status summary.

## Provider Mapping

| Provider State | Runtime Profile Classification |
| --- | --- |
| Missing or blocked provider | `local-dev` unless explicitly requested otherwise |
| Local or file-backed provider | `local-dev` |
| Configured or discovered Cosmos | `live-readonly` planning model |
| Provisioned future-target Cosmos | `runtime-cosmos-future` |
| Explicit future write request | `production-write-approved`, still blocked |

## Ice Mapping

Ice provisioned future-target Cosmos maps to `runtime-cosmos-future`, not `runtime-configured`.

## Guard Outcome

All live export and runtime switch paths return blocked in Phase 2F-12K.

