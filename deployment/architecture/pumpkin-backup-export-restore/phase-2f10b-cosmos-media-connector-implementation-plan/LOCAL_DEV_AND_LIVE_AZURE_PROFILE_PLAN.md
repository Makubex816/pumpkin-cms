# Local Development And Live Azure Profile Plan

## Purpose

The connector implementation should make the source profile explicit so local testing, read-only discovery, and future approved export runs cannot be confused.

## Profiles

### `fixture`

Uses checked-in fake fixtures only. This is the default for automated tests.

Allowed:

- Fake Cosmos discovery.
- Fake Cosmos JSON export.
- Fake blob inventory.
- Fake blob copy into ignored `.tmp`.
- Validator and restore-plan tests.

### `local-dev`

Uses local development data only if provided through safe fixture paths or approved local emulator endpoints.

Allowed:

- Local-only discovery.
- Local-only export into ignored `.tmp`.
- Local-only media fixture copy.

Disallowed:

- Protected config reads.
- Live Azure access.
- Real secret export.

### `azure-readonly`

Uses an already-authenticated operator session or approved process environment to collect read-only metadata.

Allowed only after approval:

- Cosmos account/database/container discovery.
- Platform backup evidence.
- Media source discovery.
- Blob inventory if separately approved.

Disallowed:

- Cosmos document export.
- Blob download.
- Resource mutation.

### `azure-export-approved`

Future explicit approval profile for tenant-scoped portable JSON export and approved media copy/download.

Allowed only after approval:

- Tenant-scoped Cosmos JSON export.
- Approved blob copy/download.
- Manifest/checksum integration.
- Restore-plan dry run.

Disallowed:

- CMS writes.
- Azure resource mutation.
- Secret export.
- Live restore.

## Profile Resolver Requirements

The resolver must:

- Require an explicit profile.
- Print only env presence states.
- Reject unknown providers.
- Reject missing tenant scope.
- Reject protected config file paths.
- Record the profile and approval reference in reports.
