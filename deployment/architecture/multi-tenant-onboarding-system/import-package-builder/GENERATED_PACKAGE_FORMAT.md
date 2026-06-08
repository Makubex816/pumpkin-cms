# Generated Package Format

The builder writes a validator-ready local package folder. The generated folder is not imported into CMS by this tool.

## Files

| File | Purpose |
| --- | --- |
| `README.md` | Boundary summary for the generated package. |
| `manifest.json` | Package identity, file list, and validation gate metadata. |
| `tenant.json` | Tenant identity with runtime-only secret placeholder. |
| `site.json` | Domain and deployment profile references. |
| `routes.json` | Approved and forbidden routes. |
| `pages/*.json` | One page document per page answer. |
| `media-assets.json` | Declared media asset references. |
| `forms.json` | Single generated form model for this skeleton phase. |
| `seo.json` | Robots, canonical base URL, sitemap policy, and final indexing gate. |
| `theme.json` | Simple navigation and placeholder theme colors. |
| `redirects.json` | Empty redirect collection for this skeleton phase. |

## Defaults

- `manifest.validation.status` is `not-run`.
- `manifest.validation.externalMutationAllowed` is `false`.
- `tenant.status` is `intake-draft`.
- `tenant.tenantApiKeyPlaceholder` is `TENANT_API_KEY_RUNTIME_ONLY`.
- generated page `status` defaults to `draft`.
- generated SEO defaults follow the answers file and should remain `noindex,nofollow` until the final indexing hard stop is cleared outside this builder.
- `redirects.json` starts with an empty redirect list.

## Route Normalization

The builder normalizes approved routes and page routes before writing:

- `/` stays `/`
- `/contact` becomes `/contact/`
- `/service-areas` becomes `/service-areas/`

## Content Blocks

If a page answer does not provide custom blocks, the builder creates:

- a content block with the page title
- one image block per `mediaRefs` entry
- one form block when `formRef` is present

The generated blocks are intentionally minimal placeholders for validator-ready package assembly.
