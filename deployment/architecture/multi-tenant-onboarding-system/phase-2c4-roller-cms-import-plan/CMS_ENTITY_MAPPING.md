# CMS Entity Mapping

This mapping is a planning assumption based on the local import package spec. It does not name hidden CMS implementation details.

| Package File | Expected CMS Concept | Planning Notes |
| --- | --- | --- |
| `manifest.json` | Import batch manifest/evidence | Names package files, package version, validation status, and local-only paused tenant approval metadata. Should not be imported as public content. |
| `tenant.json` | Tenant identity shell | Maps to Roller tenant identity, site key, display name, business type, status, tenant API key placeholder, and paused-related metadata. No real tenant key value is present. |
| `site.json` | Site/domain profile | Maps to primary domain, `www` domain, media domain, deployment profile ID, and canonical host metadata. Does not authorize DNS, Cloudflare, Azure, Search Console, deployment, or live pages. |
| `routes.json` | Route allowlist/denylist | Maps approved and forbidden routes. Import must preserve forbidden preview/draft/old routes as blocked. |
| `pages/*.json` | Draft page/content records | Maps one page per approved route with title, status, SEO, canonical URL, and blocks. Import should be draft/preview only. |
| `media-assets.json` | Media reference metadata/placeholders | Maps media IDs, filenames, kind, alt text, source status, and public URL placeholders. No binary upload or MediaAsset write is approved in this phase. |
| `forms.json` | Form definition/routing reference | Maps form ID, display name, delivery mode, `leadRecipientRef`, legacy `recipientGroup`, fields, consent status, rollback mode, and profile-managed endpoint ref. No email sending is approved. |
| `seo.json` | SEO metadata/hard-stop settings | Maps `noindex,nofollow`, canonical base URL, sitemap policy, and indexing final gate. Search Console and indexing remain blocked. |
| `theme.json` | Theme/navigation/settings | Maps theme ID, display name, navigation, and colors as draft site settings. |
| `redirects.json` | Redirect definitions | Maps redirect rules. Current local package has no redirects. |
| `validation-report.json` | Evidence only | Used by operator for import approval evidence. Not public content. |
| `support-packet.json` and handoff files | Evidence/support only | Used for operator review and troubleshooting. Not imported as public content. |

## Missing Optional Spec Files

The broader spec references `owner-contacts.json` and `approvals.json`, but the current generated builder package records owner and approval state through generated README/support evidence and hard-stop metadata. Before CMS import execution, the operator should either confirm the current builder package shape is accepted for this import path or require separate owner/approval artifacts.
