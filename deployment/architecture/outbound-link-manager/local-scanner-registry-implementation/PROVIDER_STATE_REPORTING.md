# Provider State Reporting

The provider state report summarizes the staging-simulated provider store and readiness state.

Output:

```text
provider-state-report.json
```

It includes provider profile ID, provider mode, staging execution run ID, readback run ID, apply-plan ID, tenant/site keys, counts by target entity, readback status, comparison status, replay status, and live-write readiness.

Phase 2H-21 hardens the report with gate criteria and required future evidence. The report now records passed local/staging-simulated checks plus blocked `live-readonly` and `live-write-approved` execution gates.

Live-readonly, live-write, production-runtime, and production database migration readiness remain false in this phase.

Future live-write approval requires browser/runtime QA evidence, live-readonly provider verification, a real staging provider conflict/readback plan, Backup Center pre-execution proof, Resource Registry refresh approval, operator signoff, and rollback/readback planning.
