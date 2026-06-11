# Known Limitations

This is a local foundation, not a production Outbound Link Manager.

Current Phase 2H-20 limitations:

- fixture JSON only
- file-backed local `.tmp` persistence only
- local API contract/service behavior only
- local write-action simulations and API-shaped preflight only
- Admin write controls call local/fake preflight models only
- API write routes use scoped local/fake providers only
- migration dry-run output is local production-candidate JSON only
- apply-plan output is local provider-shaped planning JSON only
- staging provider adapter and provider store are simulated only
- staging execution writes only under ignored `.tmp`
- readback verification reads only the local simulated store
- live-readonly profiles block write planning
- live-write-approved profiles remain unavailable in this package
- no production provider implementation exists
- no migration execution implementation exists
- rollback plans are evidence artifacts, not executable production tooling
- scan-run simulation does not crawl or verify live external links
- policy update simulation does not save to any production provider
- no production provider write implementation
- no real provider readback implementation
- no provider conflict detection against live data
- no production Admin write form submits to a live provider
- no CMS/API integration
- no Azure/Cosmos provider wiring or mutation
- no live-readonly inventory mode for outbound links beyond profile-block evidence
- local role/tenant guards are simulations, not production auth
- pagination is page/pageSize only, not cursor-based yet
- response models now have local JS and Pumpkin API DTO shapes, but no shared generated contract package yet
- no full JSON Schema engine
- no database migration or schema migration execution
- render decisions are emitted as deterministic local artifacts, not runtime site behavior
- conservative URL extraction from declared fields and rich text strings only

The next step should be a scoped staging persistence execution preflight that keeps local/fake/offline profiles intact and proves exact credential-reference, conflict/readback, rollback, and browser QA gates before any real staging provider writes can be considered.
# Phase 2H-22 Staging Execution Package Builder Limitations

- Phase 2H-22 builds an approval package only; it does not perform the first real staging-provider write.
- Runtime QA evidence is local/source-harness evidence unless a future phase explicitly provides safe browser tooling.
- Staging target values remain non-secret placeholders until a future approval provides the approved staging profile.
- Live-readonly and live-write-approved profiles remain future-gated.
- Production database migration remains blocked.
