# Validation Gate Model

## Gate Types

| Gate | Purpose |
| --- | --- |
| intake validation | Ensures required human decisions are present and clear. |
| schema validation | Ensures JSON files match versioned contracts. |
| cross-file validation | Confirms tenant ID, site key, routes, media IDs, forms, and SEO agree across files. |
| route validation | Requires approved routes and forbidden route exclusion. |
| preview validation | Confirms drafts/previews are not public production output. |
| media validation | Confirms media URL shape, host, content type, and no local paths. |
| form validation | Confirms endpoint config, CORS/preflight, consent, and no duplicate unsafe submissions. |
| static output validation | Confirms sitemap, robots, canonical, noindex, public payload, and artifact hygiene. |
| staging smoke | Confirms staging route/media/form behavior in the selected profile. |
| production smoke | Confirms live apex/primary and `www` behavior after cutover. |
| owner review | Confirms human content/legal/form/monitoring/rollback acceptance. |
| indexing hard stop | Prevents Search Console/indexing until final approval. |

## Gate Result Shape

Every gate should return:

- gate ID
- tenant ID
- site key
- status: `pass`, `fail`, `warning`, `blocked`, or `not-applicable`
- summary for non-technical users
- detailed operator notes
- evidence paths
- next action
- whether external mutation occurred

