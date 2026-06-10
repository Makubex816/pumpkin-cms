# Known Limitations

This is a local foundation, not a production Outbound Link Manager.

Current Phase 2H-17 limitations:

- fixture JSON only
- file-backed local `.tmp` persistence only
- local API contract/service behavior only
- local write-action simulations and API-shaped preflight only
- Admin write controls call local/fake preflight models only
- API write routes use scoped local/fake providers only
- migration dry-run output is local production-candidate JSON only
- no production provider implementation exists
- no migration execution implementation exists
- rollback plans are evidence artifacts, not executable production tooling
- scan-run simulation does not crawl or verify live external links
- policy update simulation does not save to any production provider
- no production provider write implementation
- no production Admin write form submits to a live provider
- no CMS/API integration
- no Azure/Cosmos provider wiring
- no live-readonly inventory mode for outbound links
- local role/tenant guards are simulations, not production auth
- pagination is page/pageSize only, not cursor-based yet
- response models now have local JS and Pumpkin API DTO shapes, but no shared generated contract package yet
- no full JSON Schema engine
- no database migration or schema migration execution
- render decisions are emitted as deterministic local artifacts, not runtime site behavior
- conservative URL extraction from declared fields and rich text strings only

The next step should be a staging/live provider approval package that keeps local/fake/offline profiles intact while proving whether any live-write-approved profile can be safely enabled later.
