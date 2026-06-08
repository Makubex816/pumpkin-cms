# Generated Package Format

The builder writes a validator-ready local package folder. The generated folder is not imported into CMS by this tool.

## Files

| File | Purpose |
| --- | --- |
| `README.md` | Boundary, owner, approval, and generation summary. |
| `manifest.json` | Package identity, file list, and validation gate metadata. |
| `tenant.json` | Tenant identity with runtime-only secret placeholder. |
| `site.json` | Domain and deployment profile references. |
| `routes.json` | Approved and forbidden routes. |
| `pages/*.json` | One page document per page answer. |
| `media-assets.json` | Declared media asset references. |
| `forms.json` | Generated form collection. |
| `seo.json` | Robots, canonical base URL, sitemap policy, and final indexing gate. |
| `theme.json` | Simple navigation and placeholder theme colors. |
| `redirects.json` | Empty redirect collection for this phase. |

## Defaults

- `manifest.packageVersion` is `0.2.0`.
- `manifest.validation.status` is `not-run`.
- `manifest.validation.externalMutationAllowed` is `false`.
- `tenant.status` is `intake-draft`.
- `tenant.tenantApiKeyPlaceholder` is `TENANT_API_KEY_RUNTIME_ONLY`.
- generated page `status` defaults to `draft`.
- generated SEO must remain `noindex,nofollow` until the final indexing hard stop is cleared outside this builder.
- `redirects.json` starts with an empty redirect list.
- forbidden route defaults include `/draft/`, `/preview/`, and `/old/`.

## Route Normalization

The builder normalizes approved routes and page routes before writing:

- `/` stays `/`
- `/contact` becomes `/contact/`
- `/service-areas` becomes `/service-areas/`

`routing.trailingSlashPolicy` must be `always`.

## Content Blocks

If a page answer does not provide custom blocks, the builder creates:

- a content block with the page title
- one image block per `mediaRefs` entry
- one form block when `formRef` is present

If custom blocks are supplied, the builder checks media and form references before generation. The offline validator still performs package-level schema and reference checks after generation.

## Field Catalog Alignment

Phase 2B-2 validates catalog fields that are not yet part of the import package schemas, including analytics decisions, privacy review, owner contacts, and manual approvals. Those records are summarized in the generated `README.md` and support reports, but they are not written as extra package JSON files because the current offline validator only validates the approved import package schema files.

The builder keeps generated package JSON limited to the schema-supported files listed above.
