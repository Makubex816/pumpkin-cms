# Local Development Profile Plan

## Purpose

The `local-dev` profile keeps development and tests independent from live Azure resources and protected configuration.

## Behavior

- Use fake/local provider resolver fixtures.
- Use fake Cosmos and media connector fixtures.
- Use ignored `.tmp` output only for generated test data.
- Never read protected config files.
- Never require account keys, connection strings, SAS values, or tokens.
- Never perform Azure, CMS, database, or blob operations.

## Ice Local State

Ice may be represented locally as a provisioned future Cosmos target using non-secret fixture metadata. That fixture must remain explicitly disabled for live runtime writes.

## Tests Required Later

- Local profile returns fake provider metadata.
- Local profile rejects secret-bearing fields.
- Local profile cannot select `production-write-approved`.
- Local profile leaves `liveExportAllowed`, `runtimeSwitchAllowed`, and `dataSeedAllowed` false.

