# Data Seed And Migration Gates

## Purpose

If Cosmos is newly provisioned, Ice production content must be seeded or migrated through a controlled gate before Backup Center can export a complete database source.

## Preflight Requirements

- source-of-truth content package identified;
- current CMS/API content snapshot captured through approved read-only export if available;
- migration plan maps tenants, site records, pages, routes, themes, forms, media metadata, publish runs, import runs, and users as applicable;
- rollback plan exists;
- readback verification plan exists;
- owner approval exists for database/CMS writes;
- live pages remain hard-stopped unless separately approved.

## Execution Requirements

Execution is not approved in Phase 2F-12C. A future execution must:

- use exact tenant/site scope;
- write only approved records;
- avoid secrets and protected config;
- capture before/after counts;
- run readback verification;
- update Backup Center source map;
- leave export blocked until verification passes.

## Abort Rules

Abort migration if:

- tenant/site scope is ambiguous;
- source package fails validation;
- provider metadata endpoint disagrees with expected Cosmos source;
- rollback capture is missing;
- any secret-like value appears in seed data;
- live-page publication would be required.
