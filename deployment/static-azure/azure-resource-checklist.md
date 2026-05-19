# Azure Resource Checklist

Phase 5C does not create Azure resources. This checklist is for the first deployment implementation phase.

## Option 1: Azure Static Web Apps

Suggested resources:

- `swa-ice-rink-rentals-prod`
- `swa-roller-rink-rentals-prod`

Pros:

- straightforward static-site deployment
- custom domain support
- managed TLS
- good fit for site-specific artifacts
- GitHub Actions integration is simple

Cons:

- deployment model is tied to Static Web Apps conventions
- advanced CDN/WAF behavior may still be delegated to Cloudflare
- separate resources are recommended for clean tenant isolation

Checklist:

- create one Static Web App per site/domain
- configure production branch or manual deployment token flow
- copy and review the relevant template from `deployment/static-azure/github-actions-examples/` if GitHub Actions will deploy it
- add custom domain
- validate HTTPS certificate
- upload static output only after validation
- confirm `index.html`, route folders, `sitemap.xml`, and `robots.txt`
- confirm fallback/404 behavior

## Option 2: Azure Storage Static Website

Suggested storage-account naming direction:

- `sticerinkrentalsprod`
- `strollerrinkrentalsprod`

Exact names must be globally unique and comply with Azure Storage naming rules.

Pros:

- simple static file hosting
- predictable `$web` container
- easy artifact overwrite model
- can pair well with Cloudflare or Azure CDN/Front Door

Cons:

- custom-domain HTTPS requires extra planning
- usually needs Cloudflare, Azure CDN, or Front Door for polished public HTTPS/CDN
- deployment scripts must handle deletion/sync carefully

Checklist:

- create one storage account per site or one account with clearly separated deployment process
- enable static website hosting
- set index document to `index.html`
- set error document to `404.html`
- upload static output to `$web`
- configure CDN/Front Door/Cloudflare for public HTTPS
- validate canonical host and redirects

## Custom Domain Checklist

For each domain:

- verify DNS ownership
- configure apex and `www` behavior
- decide canonical host
- configure redirects
- verify TLS certificate
- validate `sitemap.xml` canonical URLs
- validate robots sitemap URL
- confirm no cross-domain canonical leakage

## Staging Vs Production

Recommended staging pattern:

- build and validate static output from the same content artifact that production will use
- deploy to staging host first
- run route and canonical checks
- promote the same artifact to production
- purge Cloudflare after production upload succeeds

Avoid rebuilding different content for staging and production unless the content artifact is pinned by checksum/commit.

## Rollback Readiness

Before first production launch:

- keep the previous artifact available
- record artifact commit SHA and generated timestamp
- document manual rollback commands
- verify rollback before enabling aggressive HTML caching
