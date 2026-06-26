# Risk And Open Decisions

Resolved in V2.8.25:

- Managed API discovery works in isolated staging with v3-compatible `function.json` discovery.
- The contact handler can accept the approved isolated synthetic POST.
- The v4 discovery/package shape remains the likely root cause of the V2.8.24 404.

Remaining risks:

- Production has not been remediated.
- Production live POST has not been retried.
- Backend email/provider delivery was not verified and remains future-gated.
- The v4 programming model remains unproven for this SWA managed API package.

Open decision:

- Next production remediation should either adopt the proven v3-compatible package shape or explicitly approve a separate v4 discovery investigation. The recommended path is the proven v3-compatible package.
