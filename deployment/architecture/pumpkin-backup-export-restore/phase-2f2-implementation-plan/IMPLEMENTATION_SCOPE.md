# Implementation Scope

## Future Phase 2F Build Scope

The Phase 2F implementation track should eventually build:

- local standard backup exporter;
- manifest writer;
- checksum writer;
- CMS content exporter;
- media inventory exporter;
- static evidence exporter;
- redacted config inventory exporter;
- database export planner, not real database export in the first local prototype;
- backup validator;
- encrypted escrow request/policy/export interfaces;
- restore validation dry-run;
- job model;
- artifact model;
- audit log model;
- CLI wrapper;
- future API and Admin UI wrappers.

## Phase 2F-2 Scope

Phase 2F-2 defines the plan only:

- module boundaries;
- data model relationships;
- schema contracts;
- command and endpoint shapes;
- test fixtures;
- acceptance criteria;
- next implementation prompt.

## Phase 2F-2 Boundary

Phase 2F-2 does not create implementation files, run exporters, create backup folders, generate zips, create escrow payloads, read secrets, restore data, or call external systems.
