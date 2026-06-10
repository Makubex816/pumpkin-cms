# Known Limitations

Remaining limitations:

- no production persistence provider
- no production database migration
- no Admin confirmation modal or production submit flow
- no staging/live rehearsal
- rollback plans are evidence artifacts only
- scan-run creation is simulated and does not crawl external links
- local/fake Admin responses are not persisted
- API and Admin contracts are not yet generated from a shared schema package

These limitations are intentional for a no-uncontrolled-live-write phase.
