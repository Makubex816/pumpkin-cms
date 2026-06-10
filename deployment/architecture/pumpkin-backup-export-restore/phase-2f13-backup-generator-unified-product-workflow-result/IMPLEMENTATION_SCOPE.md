# Implementation Scope

Phase 2F-13 implemented the local/offline and approved live-readonly Backup Generator workflow inside:

`deployment/architecture/pumpkin-backup-export-restore/backup-implementation/`

In scope:

- one-command `fake-complete` generator;
- one-command Ice `live-readonly` generator;
- optional `.tmp` ZIP download package writer;
- Resource Registry reference files inside generated bundles;
- operator summary, retention, and restore-plan summary files;
- manifest and checksum refresh after product files are added;
- final validator reports including `VALIDATION_RESULT.json`;
- generator tests and CLI docs;
- local fake proof output under `.tmp`;
- approved live-readonly Ice proof output under `.tmp`.

Out of scope:

- CMS runtime switch;
- CMS writes;
- Cosmos writes;
- storage mutation;
- keys/listKeys;
- connection strings;
- SAS generation;
- protected config reads;
- database import;
- restore execution;
- deployment;
- Search Console/indexing;
- live-page publication;
- staging generated `.tmp` backup artifacts.
