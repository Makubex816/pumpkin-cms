# Risk And Open Decisions

## Residual Risks

- The handoff packet validator is local fixture validation only; no Admin/API runtime handoff packet consumer exists yet.
- Authenticated API route checks for handoff data remain future-gated if they require token or protected config material.
- The invalid fixtures intentionally include synthetic failure markers; they must remain test fixtures only.

## Open Decisions

- Whether V2.12.2 should plan Admin first, API first, or a shared read-only contract before either surface changes.
- Whether future API handoff packet endpoints should reuse `/api/admin/import-executions` projection envelopes or expose a separate GET-only handoff route.
- Whether Electron remains planning-only for the entire V2.12 lane.

## Closed Decisions

- V2.12.1 remains local/read-only.
- Handoff packets are references-only, no-secret, no-archive artifacts.
- Roller remains paused/no-import/no-resume.
- OLM 2H-23A remains separate.
- Google/Search Console/indexing remains deferred.
