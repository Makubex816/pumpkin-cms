# Risk And Open Decisions

Open decisions:

- Whether V2.11.5 should start local dev servers for browser-visible runtime signoff with explicit safe config handling.
- Whether future import execution should exist as a separate executor service, job runner, or Admin-triggered workflow.
- What exact approval artifact is required before Roller resume can be considered.

Residual risk:

- The current Admin API bridge is optional and falls back to fixtures when auth/runtime is unavailable.
- No live-provider parity exists because live provider integration remains gated.
