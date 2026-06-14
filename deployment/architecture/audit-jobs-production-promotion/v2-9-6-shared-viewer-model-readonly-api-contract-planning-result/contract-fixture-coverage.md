# Contract Fixture Coverage

Status: passed.

Valid coverage:

- combined V2.8 ledger validates as ledger;
- combined V2.8 ledger creates shared viewer contract;
- combined V2.8 ledger creates read-only API envelope;
- generated API envelope fixture validates via CLI.

Invalid coverage:

- missing required API envelope field;
- enabled mutation action;
- token-like field name without storing token material;
- mismatched Admin/viewer model count shape.

Tests passed: 22.
