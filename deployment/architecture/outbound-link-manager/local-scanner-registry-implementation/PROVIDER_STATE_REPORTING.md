# Provider State Reporting

The provider state report summarizes the staging-simulated provider store and readiness state.

Output:

```text
provider-state-report.json
```

It includes provider profile ID, provider mode, staging execution run ID, readback run ID, apply-plan ID, tenant/site keys, counts by target entity, readback status, comparison status, replay status, and live-write readiness.

Live-readonly, live-write, and production-runtime readiness remain false in this phase.

