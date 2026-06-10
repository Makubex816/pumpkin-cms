# Schema Contract Plan

## Phase 2H-3

- Load JSON schemas from `../schemas`.
- Validate all generated fixture records against schemas.
- Validate templates still parse and use only safe example URLs.
- Add negative fixtures for missing tenant/site scope, bad status, unsupported URL scheme, and unsafe location path.

## Phase 2H-4

- Decide whether schemas are copied into a package or referenced in place.
- Add TypeScript contract types for local scanner.
- Draft C# model mapping notes for Pumpkin API.

## Versioning

Current schema version: `0.1.0`.

Breaking changes require:

- schema version bump;
- fixture migration notes;
- backup/restore compatibility note;
- renderer snapshot compatibility note.

## Contract Ownership

Architecture package owns the draft contract until runtime packages exist. Future shared contract ownership should move to a versioned package only after local proof passes.
