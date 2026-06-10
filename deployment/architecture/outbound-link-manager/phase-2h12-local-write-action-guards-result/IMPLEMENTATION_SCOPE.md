# Implementation Scope

Implemented:

- local action request model
- approval-required guard service
- review decision simulator
- link status simulator
- instance status simulator
- policy update simulator
- scan-run simulator
- bulk action preflight simulator
- publishing impact analyzer
- action audit writer
- rollback plan writer
- action result validator
- CLI commands `simulate-action` and `validate-action-result`
- action fixtures
- write-action guard tests
- local docs and root report
- Admin disabled-action wording refresh

Not implemented:

- production API write routes
- database migrations
- Admin write submit handlers
- live provider writes
- external link crawling
- CMS writes
- Azure/CMS/API mutations
