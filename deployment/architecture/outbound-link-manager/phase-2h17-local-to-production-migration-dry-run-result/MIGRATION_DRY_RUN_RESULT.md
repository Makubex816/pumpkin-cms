# Migration Dry-Run Result

Command path:

```powershell
node src/outbound-link-cli.mjs migration-dry-run --store .tmp/phase-2h17-migration-dry-run-source/local-store-policy --profile fixtures/migration-production-provider-profile.fixture.json --rendered .tmp/phase-2h17-migration-dry-run-source/render-active --out .tmp/phase-2h17-migration-dry-run --overwrite
```

Result:

- status: passed
- migration run: `olmr_phase_2h17_fixture`
- tenant: `fixture-tenant`
- site: `fixture-site`
- provider mode: `local-to-production-dry-run`
- total candidate records: 48
- output root: `.tmp/phase-2h17-migration-dry-run`

Entity counts:

- `outbound_links`: 5
- `outbound_link_instances`: 5
- `outbound_link_policies`: 2
- `outbound_link_scan_runs`: 1
- `outbound_link_audit_logs`: 2
- `outbound_link_render_decisions`: 5
- `outbound_link_review_decisions`: 1
- `outbound_link_bulk_actions`: 2
- `outbound_link_rollback_plans`: 1
- `outbound_link_trace_logs`: 24

