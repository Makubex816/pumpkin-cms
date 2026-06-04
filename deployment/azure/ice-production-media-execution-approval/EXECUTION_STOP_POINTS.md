# Execution Stop Points

Generated: 2026-06-04

## Required Stop Points

A future execution run must stop for review:

1. after read-only Azure storage checks
2. before Azure resource creation
3. before Blob container creation
4. after container confirmation and before upload
5. after first media upload verification
6. before Cloudflare/DNS changes
7. after Cloudflare media hostname validation and before MediaAsset updates
8. before any CMS or MediaAsset write
9. after MediaAsset readback and before static export
10. after static export and before treating readiness as improved
11. before marking media production URL readiness `yes`

## Automatic Stop Conditions

Stop immediately if:

- an unexpected route appears
- an expected route is missing
- any unrelated MediaAsset record would change
- any local media source hash differs from the approved map
- any secret value is about to be printed
- protected config access is required but not explicitly approved
- Roller appears in scope
- generated static artifacts would be staged
- raw images would be staged

## Current Run Result

Stop points documented only.
