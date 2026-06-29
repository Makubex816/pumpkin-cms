# Sitemap Negative Proof Result

The same proof page was updated once through the isolated Admin UI to set `includeInSitemap=false`.

Result:

- UI update attempts: 1
- Admin update response: HTTP 200
- Admin readback after update: `includeInSitemap=false`
- Sitemap route status after update: HTTP 200
- Proof slug included after exclusion: false

This confirms that the tenant sitemap output excludes the page after the field is disabled.

