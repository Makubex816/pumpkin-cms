# Electron Consumer Contract Mapping

Status: planned only; no Electron runtime implemented.

Future Electron consumer expectations:

- Read the same read-only API envelope shape as Admin.
- Accept `providerMode: future-electron-cache-readonly` only for a local cached copy that passed contract validation.
- Display summary, panels, events, jobs, gates, evidence, traces, warnings, blockers, and next gates without mutation controls.
- Preserve `redactionPolicy` and `securityBoundary` as visible diagnostics.
- Treat any enabled mutation action, open security flag, or missing deferred indexing marker as a blocking contract error.

Electron runtime, local cache sync, file watchers, provider writes, and API calls are not implemented in V2.9.6.
