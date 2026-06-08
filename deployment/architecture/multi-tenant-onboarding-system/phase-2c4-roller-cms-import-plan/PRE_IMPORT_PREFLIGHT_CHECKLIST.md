# Pre-Import Preflight Checklist

Use this checklist before any future CMS import execution request.

## Approval And Scope

- [ ] Future approval names Roller Rink Rentals.
- [ ] Future approval names exact package path.
- [ ] Future approval names evidence path.
- [ ] Future approval names allowed systems.
- [ ] Future approval names excluded systems.
- [ ] Future approval names rollback owner.
- [ ] Future approval confirms hard stop before live pages.
- [ ] Approval excludes Azure, Cloudflare, DNS, deployment, Function App settings, email, Microsoft 365, Search Console, indexing, and external checks.

## Local Evidence

- [ ] Builder tests passed recently.
- [ ] Validator tests passed recently.
- [ ] Roller package validator report is passed with 0 errors.
- [ ] Roller package validator report has 0 warnings or accepted documented warnings.
- [ ] Support packet exists.
- [ ] Operator handoff exists.
- [ ] Support packet source files copied is false.
- [ ] Generated package output is ignored and not staged.

## Package Safety

- [ ] Package contains no secrets.
- [ ] Package contains no protected local paths.
- [ ] Package contains no private customer data.
- [ ] Package contains no tokenized private URLs.
- [ ] Package contains no raw production credentials.
- [ ] Form delivery remains `no-email`.
- [ ] Search Console/indexing remains hard-stopped.
- [ ] Live pages remain hard-stopped.

## Review Owners

- [ ] Business/content owner is confirmed.
- [ ] Media owner is confirmed.
- [ ] Form oversight owner is confirmed.
- [ ] Legal/privacy owner is confirmed.
- [ ] Analytics decision owner is confirmed.
- [ ] Monitoring owner is confirmed.
- [ ] Rollback owner is confirmed.
- [ ] Final indexing owner is confirmed.

## Stop If

- any secret appears
- any owner is unknown for execution
- validation is not passed
- rollback owner is missing
- live-page publication is requested
- Search Console/indexing is requested
- external systems are requested inside the CMS import gate
