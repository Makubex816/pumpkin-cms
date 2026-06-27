# Pre-Mutation Go/No-Go Decision

Decision: go for exact Static Web App app-setting binding only.

Rationale:

- Static contact `pumpkin-api` mode is source-confirmed.
- Required public-safe static binding values were present.
- Required protected static tenant API key was present by boolean check only.
- Operator-provided tenant API key values matched.
- Binding approval flags were true.
- Live POST/readback approvals were false, so no live submission or readback was attempted.

Pumpkin API Web App appsetting mutation decision: no-go/not applicable for this phase.

Rationale:

- `PUMPKIN_API_FORMENTRY_PROVIDER_BINDING_SECRET` is not a source-confirmed Pumpkin API app-setting name.
- The API write path validates Bearer tenant keys against the active tenant database record.
- No approved operator-provided protected values were available for API database or JWT settings.
- Therefore no `az webapp config appsettings set` command was run.
