# Monitoring Backup Hardening Status

V2.8.45 applied and preserved monitoring/storage hardening:

- Observability resource group exists.
- Log Analytics workspace exists.
- Operations email action group exists.
- Six low-noise metric alerts exist.
- Diagnostics were applied in prior phases.
- Media storage protection was enabled in prior phases.
- Cosmos Continuous30Days backup was confirmed in prior phases.
- App Service platform snapshots were confirmed in prior phases.

V2.8.52 read-only Azure inventory confirmed:

- `rg-pumpkin-observability-prod-centralus` exists with 8 resources.
- `law-pumpkin-prod-centralus-001` exists.
- `ag-pumpkin-prod-ops-email-001` exists.
- Six metric alerts exist.

Deferred:

- Custom App Service backups remain deferred because they require backup storage/SAS-style configuration outside the current no-key policy.
