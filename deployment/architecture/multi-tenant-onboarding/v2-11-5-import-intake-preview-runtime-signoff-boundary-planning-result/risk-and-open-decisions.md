# Risk And Open Decisions

Residual risks:

- Localhost API 200-level checks are not signed off because authorization/runtime config is outside the no-protected-config boundary.
- Localhost Admin route serving is not signed off because the dev server was not started.
- API-backed Admin mode is signed off by source/QA/fallback evidence, not by live localhost browser serving.
- A broader pre-existing `import-runs` mutation route exists outside the new import-intake surface and should be kept out of the V2.11 import execution path unless explicitly reviewed.
- Future import execution still needs approval manifest, dry-run preflight, backup/readback/audit bindings, and no-go clearance.

Open decisions:

- Whether V2.11.6 should remain no-write dry-run only or include implementation of an approval manifest validator.
- Whether future API runtime localhost testing should use a repo-supported test auth harness.
- Whether Ice should be the first scoped execution candidate after no-write dry-run.
- Whether Roller should stay paused indefinitely or receive a separate resume planning phase.

