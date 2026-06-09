# Read-Only Evidence Baseline

## Phase 2E-2 Evidence Used

| Area | Evidence |
| --- | --- |
| Env presence gate | required/expected vars present in Phase 2E-2 |
| Usable refresh requests | 22 GET, 0 HEAD, 0 mutation |
| Tenant list | 200, 3 tenants |
| Target Roller tenant | 200 |
| Active tenant signal | true |
| Roller domain signal | true |
| Target tenant pages | 200, 4 pages |
| Global admin pages | 200, 9 pages |
| Import runs | 200, 0 returned |
| Media assets | 200, 0 returned |
| Themes | 200, 1 returned |
| Active theme | 200 |
| Public sitemap | 200, 3 entries |
| Form recipient ref mentions | 0 in refreshed page/index scans |
| Media ref mentions | 0 in refreshed page/index scans |

## Page Baseline

| Page/route | Evidence | Baseline decision |
| --- | --- | --- |
| `home` / `/` | admin 200, public 200, published, sitemap-included | existing record must be preserved unless owner approves exact update |
| `contact` / `/contact/` | admin 200, public 200, published, sitemap-included | existing record must be preserved unless owner approves exact update |
| `service-areas` / `/service-areas/` | admin 404, public 404, absent from sitemap | future create candidate only |
| `roller-rink-rentals` / `/roller-rink-rentals/` | admin 200, public 200, published, sitemap-included | preserve pending owner purpose decision |
| `roller-phase-3-duplicate-test-51412237` | unpublished, not sitemap-included | no-op unless separate cleanup gate approves |

## Evidence Limitation

Phase 2E-3 made no new CMS/API calls. It relies on Phase 2E-2 and earlier local documents.
