# Implementation Scope

## Implemented

- `backup-implementation/src/provider/provider-discovery-model.mjs`
- `backup-implementation/src/provider/provider-resolver.mjs`
- `backup-implementation/src/provider/provider-source-writer.mjs`
- provider source fixtures under `backup-implementation/fixtures/`
- provider resolver tests under `backup-implementation/test/provider-resolver.test.mjs`
- standard bundle writer integration
- manifest/component status integration
- tenant website bundle source-map hook
- CLI `resolve-provider` command
- docs and result package

## Not Implemented

- live provider-source resolver execution;
- CMS/API metadata endpoint route;
- Cosmos provisioning;
- CMS runtime wiring;
- data seed/migration;
- live Cosmos export;
- Azure discovery or mutation.

## API Endpoint Decision

Deferred. The endpoint contract is implemented locally, but route implementation should wait for a dedicated API pass with explicit authorization tests and a safe runtime metadata provider that never reads or returns protected config values.
