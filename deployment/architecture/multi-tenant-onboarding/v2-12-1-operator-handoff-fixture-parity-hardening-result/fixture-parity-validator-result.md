# Fixture Parity Validator Result

Status: passed.

Added:

- `src/operator-handoff-parity.mjs`.
- `test/operator-handoff-parity.test.mjs`.
- CLI command: `validate-operator-handoff`.
- Valid fixtures: `2`.
- Invalid fixtures: `7`.

Invalid fixture coverage:

- Package hash mismatch.
- Readback count mismatch.
- Roller resume requested.
- Secret-like marker.
- Protected-config marker.
- Archive requested.
- Indexing requested.

Validation output:

- `validOperatorHandoffFixtures`: `2`.
- `invalidOperatorHandoffFixtures`: `7`.
- `requiredFields`: `26`.
- Ice packet ID: `handoff-ice-rink-rentals-v2-12-1`.
- Roller packet ID: `handoff-roller-rink-rentals-paused-v2-12-1`.

Both valid fixtures passed through the CLI.
