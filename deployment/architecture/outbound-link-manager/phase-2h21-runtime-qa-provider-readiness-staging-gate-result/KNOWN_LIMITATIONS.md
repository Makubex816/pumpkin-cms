# Known Limitations

- Browser automation runtime was not installed in `node_modules`; Phase 2H-21 used the Node runtime-safe source/route harness.
- No screenshot, trace, or real browser artifact was generated.
- The staging provider is still local/staging-simulated and file-backed under ignored `.tmp`.
- Live-readonly and live-write-approved execution remain blocked.
- Production database migration remains blocked.
- Future real provider execution needs explicit approval and additional evidence listed in `STAGING_EXECUTION_GATE_CRITERIA.md`.

