# Risk And Open Decisions

| Item | Risk | Decision |
| --- | --- | --- |
| API runtime localhost proof | Current API request path resolves database services before the Audit Jobs handler without safe local DB configuration. | Do not read protected config or supply real connection material. Treat as V2.9.11/V2.9.x safe-local-host-mode decision. |
| Admin provider switch | Switching too early could hide fixture fallback. | Keep fixture default and require explicit `admin-api-readonly` mode. |
| Contract drift | API list envelopes differ from the original single full-envelope fixture. | Add route orchestration and parity tests that reconstruct the Admin viewer model from all eight endpoints. |
| Auth/session | Admin API client needs existing Admin auth/session. | Plan only; implementation must use existing Admin auth boundary and never ask for pasted tokens. |
| Degraded state | API failures could appear as empty data. | Render fixture fallback with explicit fallback reason. |
| Future actions | API mode could tempt enabling actions. | Keep all future actions disabled and tested in both modes. |

Open decision for a later phase:

- whether to add a safe fixture-only API host mode for local runtime GET proof without database service resolution.

