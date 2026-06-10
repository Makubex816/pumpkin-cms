# Local First Live Readonly Implementation Plan

## Local First

Phase 2H-3 must run without network access and without live CMS/API calls.

Allowed sources:

- local fixtures;
- local tenant bundle fixtures;
- local import package fixtures;
- local backup bundle fixtures.

Output must go under ignored `.tmp`.

## Live Readonly

Live-readonly discovery is future only.

Future live-readonly must:

- require explicit approval;
- read only approved CMS/API snapshots or backup exports;
- never crawl external destinations;
- never write CMS/API records;
- never read protected config;
- never use keys/listKeys, connection strings, or SAS;
- never deploy or publish.

## Mode Guarding

Every command should require an explicit mode:

- `local-fixture`;
- `tenant-bundle`;
- `import-package`;
- `backup-bundle`;
- future `live-readonly-cms-snapshot`.
