# Approval Manifest

`APPROVAL_MANIFEST.json` is the hard gate for the future first scoped staging-provider write.

It must record:

- future explicit staging write approval required: `true`
- future approval granted: `false`
- real staging provider write performed: `false`
- production database migration performed: `false`
- migration/apply/execution/readback/runtime QA IDs
- provider profile ID and provider mode
- tenantKey and siteKey
- expected entity counts
- first-write batch plan
- rollback plan ID
- no-go condition count

Phase 2H-22 creates the manifest but does not grant write approval.

