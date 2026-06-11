# API And Admin Provider State Bridge

Phase 2H-20 adds local-only provider-state readiness surfaces.

## Local API Boundary

The local package includes `api-provider-state`, which reads `provider-state-report.json` and `staging-readiness-summary.json` from `.tmp` execution evidence and returns an API-style response envelope.

```powershell
node src/outbound-link-cli.mjs api-provider-state --execution .tmp/phase-2h20-staging-persistence-integration/execution --tenant fixture-tenant --site fixture-site --out .tmp/phase-2h20-staging-persistence-integration/api-provider-state
```

## Admin Boundary

The Admin mock provider exposes staging-simulated readiness messaging in the read-only banner. It does not call live services and does not enable write actions.

