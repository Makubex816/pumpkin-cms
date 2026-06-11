# Readback Verification Plan

Future first staging-provider write readback must verify:

- tenantKey and siteKey partition scope
- expected target entity counts
- targetRecordId and targetEntity for every written record
- before/after/readback hashes when present
- trace/audit/rollback IDs
- conflict and duplicate detection
- zero unexpected records outside the approved tenant/site scope

Any mismatch is a hard stop.

