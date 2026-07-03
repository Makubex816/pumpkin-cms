# Pre-Cutover Health Checks

Result: passed.

## Isolated Preview

| Route | Status | Airstrip Content | Ice Content |
| --- | --- | --- | --- |
| `/` | HTTP 200 | yes | no |
| `/request-booking` | HTTP 200 | yes | no |
| `/packages` | HTTP 200 | yes | no |
| `/airstrip-the-club` | HTTP 200 | yes | no |

## Airstrip Public API

| Slug | Status | Tenant | Published | Sitemap | Needs Rebuild | Deployment Status |
| --- | --- | --- | --- | --- | --- | --- |
| `home` | HTTP 200 | Airstrip | true | true | false | `isolated_preview_ready` |
| `contact` | HTTP 200 | Airstrip | true | true | false | `isolated_preview_ready` |
| `packages` | HTTP 200 | Airstrip | true | true | false | `isolated_preview_ready` |
| `request-booking` | HTTP 200 | Airstrip | true | true | false | `isolated_preview_ready` |
| `service-areas` | HTTP 200 | Airstrip | true | true | false | `isolated_preview_ready` |

Additional reads:

- FormDefinition: HTTP 200.
- Active theme: HTTP 200.
- Sitemap: HTTP 200 and contained all 5 expected slugs.
- MediaAsset count: 13.
- MediaAsset tenant check: all Airstrip.
- Media URL readback: 13 of 13 first public URLs returned HTTP 200.
- Airstrip TenantAdmin login: passed.
- Ice baseline: passed.
