# Simulated Import Package Check

## Expected Package Files

| File | Simulated status |
| --- | --- |
| `manifest.json` | present |
| `tenant.json` | present |
| `owner-contacts.json` | present |
| `site.json` | present |
| `routes.json` | present |
| `pages/home.json` | present |
| `pages/contact.json` | present |
| `pages/service-areas.json` | present |
| `media-assets.json` | present |
| `forms.json` | present |
| `seo.json` | present |
| `theme.json` | present |
| `redirects.json` | present |
| `approvals.json` | present |
| `validation-report.json` | generated after validation |
| `support-packet.json` | generated only when needed |

## Simulated Cross-File Checks

| Check | Result |
| --- | --- |
| tenant ID consistent | pass |
| site key consistent | pass |
| approved routes match page files | pass |
| forbidden routes absent from page files | pass |
| page media references declared | warning; media owner must confirm rights |
| page form references declared | pass |
| owner contacts complete | warning; production cutover and rollback owners are TBD |
| Search Console final gate | blocked by design |

No import was performed.
