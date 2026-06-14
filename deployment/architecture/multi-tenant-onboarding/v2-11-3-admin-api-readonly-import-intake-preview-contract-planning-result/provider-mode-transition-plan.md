# Provider Mode Transition Plan

Future Admin provider modes:

- `admin-local-import-package-fixture-readonly`: default safe mode, reads contract fixtures.
- `admin-api-import-intake-readonly`: optional mode, reads future GET-only API envelopes.

Future API provider mode:

- `api-local-import-package-fixture-readonly`: fixture-backed API mode.

Transition:

1. V2.11.4 implements fixture-backed Admin and API read-only runtime.
2. Admin default remains fixture mode.
3. API mode can be enabled only for local/runtime QA.
4. Any failed API contract falls back to fixture mode with a degraded-state banner.

No provider mode enables import execution.
