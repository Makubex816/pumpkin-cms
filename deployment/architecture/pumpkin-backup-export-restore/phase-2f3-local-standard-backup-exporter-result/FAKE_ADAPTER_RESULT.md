# Fake Adapter Result

## Implemented Fake Adapters

| Adapter | Output |
| --- | --- |
| Fake CMS content | `cms-content/tenants.json`, `sites.json`, `pages.json`, `routes.json`, `forms.json`, `seo.json`, `redirects.json`, `theme.json` |
| Fake database planner | `database/DATABASE_EXPORT_NOT_INCLUDED.md`, `database/database-export-plan.json` |
| Fake media inventory | `media/media-assets.json`, `media/MEDIA_BLOBS_NOT_INCLUDED.md` |
| Fake static evidence | `static/static-output-manifest.json`, `static/STATIC_OUTPUT_NOT_INCLUDED.md` |
| Fake config inventory | `config-inventory/env-inventory.redacted.json`, `config-inventory/CONFIG_VALUES_REDACTED.md` |

## Boundary

Adapters read fake fixture files only. They do not call CMS/API, run database exports, copy media blobs, generate static output, read env vars, or inspect protected config.
