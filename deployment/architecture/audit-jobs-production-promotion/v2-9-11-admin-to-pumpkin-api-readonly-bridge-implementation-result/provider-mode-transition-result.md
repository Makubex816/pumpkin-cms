# Provider Mode Transition Result

Provider modes after V2.9.11:

| Layer | Mode |
| --- | --- |
| Admin fixture fallback | `admin-local-fixture-readonly` |
| Admin API bridge | `admin-api-readonly` |
| Pumpkin API read-only envelope | `api-local-fixture-readonly` |
| Source fixture provider | `local-fixture-readonly` |

Adapter rule:

- `api-local-fixture-readonly` is accepted only when Admin mode is `admin-api-readonly`;
- fixture envelopes remain valid for `admin-local-fixture-readonly`;
- runtime HTTP warning carryforward remains required for fixture mode and is not required for live API-mode envelopes.

The default Admin page still starts from fixture mode and switches only when API mode is explicitly requested.
