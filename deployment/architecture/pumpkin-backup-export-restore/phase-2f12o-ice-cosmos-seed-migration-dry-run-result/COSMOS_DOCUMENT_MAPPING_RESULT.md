# Cosmos Document Mapping Result

The dry-run mapped Ice baseline content into the approved Cosmos container set.

| Source | Document type | Container | Count |
| --- | --- | --- | ---: |
| `cms-content/tenants.json` | `tenant` | `tenants` | 1 |
| `cms-content/sites.json` | `site` | `sites` | 1 |
| `cms-content/pages.json` plus SEO | `page` | `pages` | 3 |
| `cms-content/routes.json` | `route` | `routes` | 5 |
| `cms-content/forms.json` | `form` | `forms` | 3 |
| `media/media-assets.json` | `mediaAsset` | `mediaAssets` | 12 |
| `cms-content/theme.json` | `theme` | `themes` | 1 |
| dry-run provenance | `importRun` | `importRuns` | 1 |
| none | `publishRun` | `publishRuns` | 0 |
| none | `user` | `users` | 0 |

SEO metadata is embedded into page documents because the approved container set has no separate SEO container. Media entries are metadata-only; no blob payloads are included.
