# Risk Register

| Risk | Impact | Mitigation | Status |
| --- | --- | --- | --- |
| Env check prints values | Secrets exposed in logs or docs | Presence-only script and no protected config reads | controlled |
| Placeholder command mistaken for existing importer | Operator runs wrong or unsafe tool | Mark future CMS commands as placeholders | controlled |
| Read-only preflight mutates CMS | Unauthorized tenant/content change | Require `--no-write` behavior and separate approval | hard stop |
| Import execution happens without read-only evidence | Conflicts or duplicates enter CMS | Make import approval no-go until read-only evidence passes | hard stop |
| Existing Roller records conflict with import | Duplicate tenant/site/routes | Require CMS read-only conflict checks before execution | pending future preflight |
| Partial CMS import failure | Incomplete draft/preview state | Capture IDs and require rollback approval before cleanup | controlled |
| Live pages published early | Public exposure before owner approval | Stop after CMS readback; block static/deploy/live gates | hard stop |
| Search Console/indexing requested early | Premature crawling | Keep final indexing gate excluded | hard stop |
| MediaAsset writes occur during CMS import | Unapproved asset mutation | Exclude MediaAsset writes from CMS import execution | hard stop |
| Generated `.tmp` package staged | Raw/generated artifact leakage | Confirm ignored output is not staged | controlled |

## Highest Priority Risks

The highest priority risks are secret exposure, accidental CMS mutation during read-only preflight, and bundled live-page/deployment actions. All three remain hard-stopped by this package.
