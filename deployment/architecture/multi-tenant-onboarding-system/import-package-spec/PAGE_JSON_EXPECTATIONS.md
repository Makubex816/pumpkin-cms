# Page JSON Expectations

Each page JSON file must include:

- `schemaVersion`
- `tenantId`
- `siteKey`
- `slug`
- `route`
- `title`
- `status`
- `seo`
- `blocks`

Expected values:

- `status` must be `draft` or `approved-for-preview` before CMS import.
- Production publication requires a later approval gate.
- `route` must be in `routes.json` approved routes.
- Local media paths, localhost URLs, staging URLs, draft notes, workflow metadata, review metadata, and indexing blocker text are forbidden.

Blocks should use known CMS block types and reference media/forms by IDs declared elsewhere in the package.
