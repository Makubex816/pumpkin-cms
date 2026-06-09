# Provider Resolver

## Purpose

The provider resolver records non-secret metadata about the database/provider source that backs a tenant/site. It lets Backup Center decide whether a later connector can run, whether Cosmos provisioning is required, or whether the source remains blocked.

## Implemented Foundation

- `src/provider/provider-discovery-model.mjs`
- `src/provider/provider-resolver.mjs`
- `src/provider/provider-source-writer.mjs`
- `fixtures/provider-source.*.json`
- `test/provider-resolver.test.mjs`

## Supported Fixture States

- configured Cosmos source;
- Ice missing provider source;
- Ice future-target Cosmos;
- local-dev provider;
- forbidden-field failure fixture.

## Boundary

The resolver foundation reads fixture files only. It does not read env values, protected config, CMS/API endpoints, Azure metadata, databases, blobs, or secrets.
