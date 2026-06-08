# Site JSON Expectations

`site.json` defines domains and high-level site behavior.

Required:

- `schemaVersion`
- `tenantId`
- `siteKey`
- `primaryDomain`
- `wwwDomain`
- `mediaDomain`
- `deploymentProfileId`
- `canonicalHost`

Optional:

- `stagingHostname`
- `cloudflareZoneName`
- `azureResourcePrefix`
- `searchConsoleProperty`

Search Console fields are metadata only. They do not authorize verification, sitemap submission, URL Inspection, or indexing requests.
