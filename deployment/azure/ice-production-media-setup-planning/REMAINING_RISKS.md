# Remaining Risks

Generated: 2026-06-04

## Media Risks

- production media binaries have not been uploaded
- Blob storage is planned, not provisioned
- Cloudflare media hostname is planned, not configured
- MediaAsset production fields are not updated
- local `/media/ice-rink-rentals/...` URLs remain in static output until approved media setup is complete
- incorrect checksum or file naming could break cache/rollback behavior
- clearing local media fields would remove visible approved imagery and is not recommended

## Validation Risks

- strict validators will keep failing until media and form blockers are resolved
- static output quality gates must remain `no`
- media production URL readiness must remain `no`

## Operational Risks

- DNS/cache changes require separate approval and rollback planning
- old media URLs should remain available through rollback windows
- storage credentials must never be committed or printed

## Current Risk Result

No new production risk was introduced by this planning pass because no resources, writes, uploads, DNS changes, or deployments occurred.

