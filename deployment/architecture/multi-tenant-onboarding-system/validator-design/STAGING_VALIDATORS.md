# Staging Validators

Validate:

- staging hostname is expected for the tenant
- approved routes return 200
- forbidden routes return 404 or approved redirects
- media loads from the expected host
- form preflight works from staging origin
- sitemap/robots/canonical behavior is appropriate for staging
- no secrets, protected config, local paths, or unrelated tenant content appear
- owner review link or report is created

Staging validators may run public read-only checks. Deployment requires a separate approval.

