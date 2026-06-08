# Field Definition Catalog

Classification values:

- `public`: safe to appear in package files and support packets
- `non-secret-internal`: safe metadata but not marketing/public copy
- `runtime-only-secret`: never stored in package or logs; record presence only
- `blocked-external-action`: records a future owner/gate but performs no action

| Field name | Label | Plain-English description | Required | Type | Example value | Maps to JSON path | Validation rule | Classification | Skill note |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| tenantDisplayName | Business name | Name shown to users and reviewers. | yes | string | Example Rink Rentals | `tenant.json.displayName` | 2-120 chars | public | business owner can provide |
| tenantId | Tenant ID | Stable machine-friendly tenant identifier. | yes | string | example-rink-rentals | `tenant.json.tenantId`, all scoped files | `^[a-z][a-z0-9-]{2,63}$` | non-secret-internal | operator should confirm |
| siteKey | Site key | Stable machine-friendly site identifier. | yes | string | example-rink-rentals | `tenant.json.siteKey`, all scoped files | same pattern as tenantId | non-secret-internal | operator should confirm |
| businessType | Business type | Short description of the tenant's business. | yes | string | event rentals | `tenant.json.businessType` | 2-120 chars | public | business owner can provide |
| cmsTenantSlug | CMS tenant slug | Future CMS tenant slug reference. | yes | string | example-rink-rentals | `tenant.json.cmsTenantSlug` | tenant ID pattern | non-secret-internal | operator should confirm |
| primaryDomain | Primary domain | Main public domain for the site. | yes | domain string | example.com | `site.json.primaryDomain` | domain pattern; no localhost/staging | public | operator should verify |
| wwwDomain | WWW domain | `www` host for the site. | yes | domain string | www.example.com | `site.json.wwwDomain` | must start with `www.` | public | operator should verify |
| mediaDomain | Media domain | Public media host. | yes | domain string | media.example.com | `site.json.mediaDomain` | domain pattern; no protected URL | public | media/operator review |
| deploymentProfile | Deployment profile | Intended hosting/import pattern. | yes | enum/string | static-azure-cloudflare-worker-graph | `site.json.deploymentProfileId` | profile ID exists in registry | non-secret-internal | technical operator selects |
| stagingHostname | Staging hostname | Review-only host, not production canonical. | optional | string | example-staging.azurestaticapps.net | `site.json.stagingHostname` | staging host allowed only as staging metadata | non-secret-internal | operator only |
| approvedRoutes | Approved routes | URLs allowed in the launch package. | yes | string list | `/`, `/contact/` | `routes.json.approvedRoutes` | normalized route pattern; unique | public | content owner can review |
| forbiddenRoutes | Forbidden routes | URLs that must not launch. | yes | string list | `/draft/`, `/preview/` | `routes.json.forbiddenRoutes` | unique; cannot overlap approved routes | public | operator/content review |
| trailingSlashPolicy | Trailing slash policy | Route formatting rule. | yes | enum | always | generator policy for routes/pages | generated routes end with slash except root | non-secret-internal | hidden default for low-skill users |
| canonicalHost | Canonical host | Whether canonical URLs use primary or www. | yes | enum | primary | `site.json.canonicalHost`, `seo.json.canonicalBaseUrl` | `primary` or `www`; align canonical URLs | public | SEO/operator review |
| canonicalBaseUrl | Canonical base URL | Base URL used for page canonical URLs. | yes | URL | https://example.com | `seo.json.canonicalBaseUrl` | HTTPS production host; no staging/local | public | SEO/operator review |
| defaultRobots | Default crawl setting | Search-engine instruction for generated pages. | yes | enum | noindex,nofollow | `seo.json.defaultRobots` | must be approved value | public | SEO owner confirms |
| indexingFinalGate | Indexing final gate | Hard stop proving indexing is not automatic. | yes | boolean | true | `seo.json.indexingFinalGate` | must remain true | blocked-external-action | indexing owner later |
| sitemapPolicy | Sitemap policy | Whether sitemap uses approved routes or stays disabled. | yes | enum | disabled-until-final-gate | `seo.json.sitemapPolicy` | approved enum | blocked-external-action | SEO/operator review |
| pageTitle | Page title | Human-readable page title. | yes per page | string | Contact Example Rink Rentals | `pages/*.json.title` | 2-120 chars | public | content owner |
| pageSlug | Page slug | File and URL-friendly page identifier. | yes per page | string | contact | `pages/*.json.slug` | slug pattern; unique | public | generated from route/title |
| pageRoute | Page route | Public route for a page. | yes per page | route | `/contact/` | `pages/*.json.route` | must be approved route | public | content owner |
| pageDescription | Page SEO description | Search summary or preview description. | yes per page | string | Request information from Example Rink Rentals. | `pages/*.json.seo.description` | min 20 chars | public | content/SEO owner |
| mediaId | Media ID | Stable reference for an image or asset. | yes per asset | string | hero-rink-setup | `media-assets.json.assets[].mediaId`, page blocks | stable pattern; unique | public | generated from filename/purpose |
| mediaFileName | Media file name | Asset file name for reference. | yes per asset | string | hero-rink-setup.webp | `media-assets.json.assets[].fileName` | safe filename; no path traversal | public | media owner |
| mediaAltText | Image alt text | Text alternative for image meaning. | yes per asset | string | Ice rink setup at an event | `media-assets.json.assets[].altText` | min 2 chars | public | content/media owner |
| mediaSourceStatus | Media rights status | Confirms whether image use is approved. | yes per asset | enum | usage-rights-confirmed | `media-assets.json.assets[].sourceStatus` | approved enum | public | stop if unclear |
| formId | Form ID | Stable reference for a contact form. | yes per form | string | contact-form | `forms.json.forms[].formId`, page blocks | pattern; unique | non-secret-internal | generated default |
| formRecipientRef | Form recipient reference | Named public/business recipient concept. | yes | string | primary-leads | builder draft, `owner-contacts.json` planned mapping | must map to owner/contact record | non-secret-internal | user selects owner |
| staticEndpointRef | Static endpoint reference | Placeholder for future profile-managed endpoint. | optional | string | profile-managed-contact-endpoint | form extension/reference metadata | must be placeholder, not URL secret | runtime-only-secret | operator only |
| leadRecipientRef | Lead recipient reference | Reference to lead handling owner. | yes | string | primary-leads | page block/form metadata | must match form owner/contact | non-secret-internal | operator confirms |
| recipient | Recipient email | Public or approved lead inbox. | yes per form | email | leads@example.com | `forms.json.forms[].recipient` | email format; no password | non-secret-internal | form owner confirms |
| mailboxOwner | Mailbox owner | Person/team responsible for lead inbox. | yes per form | string | Sales Ops | `forms.json.forms[].mailboxOwner` | non-empty | non-secret-internal | form owner confirms |
| consentNoticeStatus | Consent notice status | Whether form notice text is approved. | yes | enum | pending-review | `forms.json.forms[].consentNoticeStatus` | approved enum | public | legal/privacy review |
| analyticsDecision | Analytics decision | Whether analytics is omitted, deferred, or requested. | yes | enum | deferred | `approvals.json` planned, support packet | must not include scripts/tokens | blocked-external-action | owner/legal review |
| privacyReviewStatus | Privacy review status | Legal/privacy gate state. | yes | enum | pending-review | `approvals.json` planned, support packet | approved/pending/blocked values | non-secret-internal | legal/privacy owner |
| monitoringOwner | Monitoring owner | Person/team responsible after launch. | yes | string | Operations | `owner-contacts.json` planned | owner required before handoff | non-secret-internal | operator review |
| rollbackOwner | Rollback owner | Person/team that approves rollback action. | yes | string | Operations | `owner-contacts.json`, approvals | owner required before handoff | non-secret-internal | operator review |
| indexingOwner | Indexing owner | Person who can approve final indexing later. | yes | string | SEO Owner | `owner-contacts.json`, approvals | owner required; no action performed | blocked-external-action | final gate only |
| tenantApiKeyPlaceholder | Tenant API key placeholder | Placeholder proving runtime key is not stored. | yes | const | TENANT_API_KEY_RUNTIME_ONLY | `tenant.json.tenantApiKeyPlaceholder` | exact placeholder only | runtime-only-secret | never ask user for key |
