# Preserve Adopt Update Create Matrix

| Entity | Current evidence | Recommended future action | Status | Owner gate |
| --- | --- | --- | --- | --- |
| Existing tenant | active Roller tenant exists | preserve/adopt existing tenant, no creation | preserve | confirm intended tenant |
| Existing site/domain | Roller domain signal present | preserve/adopt, no DNS/platform changes | preserve | confirm domain belongs to intended tenant |
| `home` | admin/public 200, published, sitemap-included | adopt after owner review; update only exact approved deltas | adopt after owner review | content comparison |
| `contact` | admin/public 200, published, sitemap-included | adopt after owner review; update only exact approved deltas | adopt after owner review | content and form comparison |
| `service-areas` | admin/public 404, absent from sitemap | create later only with approval | create later only with approval | create route and content approval |
| `roller-rink-rentals` | admin/public 200, published, sitemap-included | preserve until purpose is decided | owner decision required | canonical/legacy/duplicate/redirect decision |
| Draft/test page | unpublished, not sitemap-included | no-op in reconciliation | preserve | separate cleanup approval if needed |
| Form recipient ref | `roller-rink-leads` absent from page/index scans | blocked until storage/mapping proven | blocked | form owner approval |
| SEO metadata | current pages already public/sitemap-included; local package expected pre-live posture | preserve until SEO gate | update later only with approval | SEO/sitemap decision |
| Sitemap inclusion | 3 public sitemap entries | preserve current state | update later only with approval | SEO/sitemap decision |
| Media refs | no media assets returned; package ref not found in page/index scans | keep package refs, no MediaAsset write | blocked for asset writes | media approval |
| Redirects | no approved redirect map | no redirect writes | blocked | owner routing decision |
| Theme | active theme present | preserve | preserve | none unless later theme changes requested |

## Default Rule

When the package and CMS state differ, preserve existing CMS state unless the owner approves a specific field-level delta and the later write-preflight proves the command can apply only that delta.
