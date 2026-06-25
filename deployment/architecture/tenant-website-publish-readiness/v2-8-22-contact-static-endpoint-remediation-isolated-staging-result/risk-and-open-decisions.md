# Risk and Open Decisions

Open blocker:

- Isolated SWA API route `/api/static-contact` returned 404 after an app-plus-API deployment that included the function package.

Risks:

- The SWA managed API deployment shape may require a different function project layout, runtime setting, or build configuration.
- The CLI reported API deployment intent, but the live route did not resolve.
- Strict artifact validators still carry a known non-contact media-origin policy mismatch from V2.8.21/V2.8.19H.

Decisions still needed:

- Whether to adapt the function package layout for SWA managed Functions or use a separate Function App endpoint.
- Whether to add explicit read-only Azure metadata checks in the next phase.
- Whether a future isolated POST should remain dry-run/no-email or verify a delivery mode.
- Whether to update legacy media-origin validators in a separate media/tooling phase.
