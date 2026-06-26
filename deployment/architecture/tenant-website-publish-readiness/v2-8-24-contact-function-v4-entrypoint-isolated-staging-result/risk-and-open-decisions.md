# Risk and Open Decisions

## Remaining Risk

The managed API route is still not discoverable for POST after a successful app-plus-API deployment with the CommonJS v4 entrypoint. This means production contact remediation cannot proceed safely.

## Open Decisions

- Decide the next isolated-only function packaging shape to test.
- Decide whether to use `package.json main=src/functions/*.js`, a root `index.js` that requires the registration module, or another SWA-supported Node v4 layout.
- Decide whether an isolated-only diagnostic phase may inspect public-safe SWA deployment/build diagnostics.
- Decide whether Azure Functions Core Tools should be installed or otherwise made available for local host-level discovery validation.

## Non-Decisions

- No production deployment is approved.
- No production live POST is approved.
- No backend delivery confirmation through inbox/provider systems is approved.
