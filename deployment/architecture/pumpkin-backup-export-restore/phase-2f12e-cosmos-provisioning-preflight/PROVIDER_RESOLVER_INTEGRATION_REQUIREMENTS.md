# Provider Resolver Integration Requirements

## Existing Foundation

Phase 2F-12D added local resolver fixtures and bundle integration. The resolver can classify:

- configured Cosmos;
- Ice missing provider source;
- Ice future-target Cosmos;
- local provider;
- forbidden-field failure.

## Required Next Integration

Before provisioning execution:

- add owner-confirmed scope input file/schema;
- compare owner worksheet to resolver output;
- keep `missing` separate from `future-target`;
- require redaction status passed;
- require `secretsIncluded = false`;
- write provider-source metadata into Backup Center preflight reports;
- keep live database export disabled.

## Required Post-Provisioning Integration

After a future provisioning execution:

- resolver must read approved non-secret metadata;
- provider status can move from `future-target` to `configured` only after read-only verification;
- tenant/site bundle source map must include the verified provider source;
- validator must still block production restore proof until export and restore-plan gates pass.
