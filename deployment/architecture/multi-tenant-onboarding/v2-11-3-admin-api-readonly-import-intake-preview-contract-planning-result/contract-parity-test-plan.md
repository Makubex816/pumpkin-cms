# Contract Parity Test Plan

Tests added in V2.11.3:

- `test/intake-preview-contract.test.mjs`
- valid Ice read-only envelope fixture;
- valid Roller paused read-only envelope fixture;
- invalid enabled-action envelope fixture.

Future V2.11.4 tests:

- Admin fixture provider matches shared model fields;
- Admin API provider accepts only read-only envelopes;
- API route envelopes match the shared contract;
- all panels appear for Ice and Roller;
- Roller remains paused/no-import;
- all future actions are disabled;
- mutation route scan finds no POST/PUT/PATCH/DELETE import-intake routes.
