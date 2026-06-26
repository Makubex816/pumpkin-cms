# API Programming Model Decision

Decision: use Azure Functions v3-compatible `function.json` discovery for the V2.8.25 isolated sentinel.

Rationale:

- V2.8.23 and V2.8.24 proved the app-plus-API deploy command can succeed.
- The v4 source package passed local readiness but still returned 404 for POST after isolated deployment.
- A v3-compatible package is the simplest discovery proof because SWA managed APIs can discover function folders directly from `function.json`.
- The deployed API package must not mix v3 and v4 programming models.

Result:

- Health route live: yes.
- Contact route live: yes.
- Single isolated POST succeeded: yes.

Production remediation should use the proven v3-compatible package shape unless a separate future phase proves a corrected v4 layout.
