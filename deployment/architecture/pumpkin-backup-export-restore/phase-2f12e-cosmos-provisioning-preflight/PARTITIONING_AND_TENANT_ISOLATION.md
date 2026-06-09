# Partitioning And Tenant Isolation

## Goal

Prevent cross-tenant data pollution during backup export, restore validation, seed, and migration.

## Required Fields

All tenant-scoped records should include:

- `tenantKey`;
- `siteKey` when site-level scope applies;
- stable record id;
- logical record type;
- created/updated timestamps when applicable.

## Partition Key Recommendation

Preferred default:

- partition key: `/tenantKey`

Alternative for high-volume site-specific containers:

- partition key: `/siteKey` only if every record is site-scoped and tenant lookup remains enforced.

## Container Strategy

Model-aligned containers are preferred for the initial target:

- tenants;
- sites;
- pages;
- routes;
- forms;
- mediaAssets;
- themes;
- publishRuns;
- importRuns;
- users.

## Export Filter Requirements

Backup Center export planning must require:

- explicit tenant key;
- explicit site key when site-scoped;
- provider resolver status `configured` or `discovered`;
- redaction status passed;
- owner-approved export phase;
- zero cross-tenant records in output.

## Restore Validation Requirements

Restore-plan dry-run must compare:

- expected tenant count;
- expected site count;
- page/route/form/theme/media metadata counts;
- tenant/site keys in every tenant-scoped record;
- absence of records from other tenants.
