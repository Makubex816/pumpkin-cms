# Answers File Format

The answers file is a local, non-secret JSON file. It is intended for fake or operator-prepared intake answers only; it must not contain passwords, API keys, private keys, tokens, signed URLs, local filesystem paths, local URLs, staging URLs, preview URLs, paused tenant references, unrelated tenant references, or URL credentials.

## Required Top-Level Fields

| Field | Purpose |
| --- | --- |
| `schemaVersion` | Must be `1.0.0`. |
| `builderProfile` | Local package generation profile. |
| `tenant` | Tenant identity and display metadata. |
| `domains` | Production-shaped public domains for generated package references. |
| `routing` | Approved routes, forbidden routes, and trailing slash policy. |
| `pages` | Page answers for every approved route. |
| `media` | Declared media assets; can be an empty array. |
| `form` or `forms` | Contact form configuration. Use one `form` object or one `forms` array, not both. |
| `seo` | Robots, canonical base URL, sitemap policy, and indexing final gate. |
| `analyticsDecision` | Decision record only; no scripts, tokens, or pixels. |
| `privacyReviewStatus` | Legal/privacy review status and owner. |
| `ownerContacts` | Manual owner records for business, content, media, form, operator, monitoring, rollback, and indexing. |
| `manualApprovals` | Manual approval gate statuses. |

## Tenant Fields

| Field | Rule |
| --- | --- |
| `tenantId` | Lowercase letters, numbers, and hyphens; 3-63 characters. |
| `siteKey` | Lowercase letters, numbers, and hyphens; 3-63 characters. |
| `tenantDisplayName` | 2-120 characters. |
| `businessType` | 2-120 characters. |
| `cmsTenantSlug` | Lowercase letters, numbers, and hyphens; 3-63 characters. |
| `tenantApiKeyPlaceholder` | Optional, but if present must be `TENANT_API_KEY_RUNTIME_ONLY`. |

## Domain Fields

| Field | Rule |
| --- | --- |
| `primaryDomain` | Plain public production domain, such as `exampleeventrentals.com`. |
| `wwwDomain` | Plain public `www` host, such as `www.exampleeventrentals.com`. |
| `mediaDomain` | Plain public media host, such as `media.exampleeventrentals.com`. |
| `canonicalHost` | `primary` or `www`. |
| `stagingHostname` | Optional staging host metadata only; not used as production canonical URL. |

Do not include `https://`, paths, usernames, passwords, query strings, or local/staging platform hosts in production domain fields.

## Routing Fields

Routes must start with `/` and use lowercase letters, numbers, and hyphens. Non-root routes are normalized with a trailing slash in the generated package.

Every approved route must have a matching page answer. A route cannot appear in both `approvedRoutes` and `forbiddenRoutes`.

`routing.trailingSlashPolicy` is required and must be `always`.

The builder always carries these forbidden route defaults into generated packages:

- `/draft/`
- `/preview/`
- `/old/`

## Page Fields

| Field | Rule |
| --- | --- |
| `route` | Must match an approved route. |
| `slug` | Optional; generated from route when omitted. Must be unique. |
| `title` | 2-120 characters. |
| `navLabel` | Optional navigation label. |
| `seoTitle` | Optional SEO title. |
| `seoDescription` | At least 20 characters. |
| `status` | `draft` or `approved-for-preview`; default is `draft`. |
| `mediaRefs` | Optional media IDs declared in `media`. |
| `formRef` | Optional form ID declared in `form` or `forms`. |
| `blocks` | Optional custom blocks; media/form references are checked before generation. |

## Secret And URL Guardrails

The builder rejects answers that look like:

- private keys
- JWTs
- AWS access key IDs
- `client_secret`, `access_token`, `api_key`, `password`, or similar assignments
- signed URL query parameters
- local paths such as `C:\...`, UNC paths, or `file://...`
- URLs on local, staging, preview, default-host, or platform-generated hosts
- URLs with embedded usernames or passwords
- unrelated tenant names or domains
- paused tenant names or domains

## Error Output

Answer validation errors include:

- `code`
- `path`
- `message`
- `suggestedFix`
- `askForHelp`

Example:

```text
ANSWERS_INVALID_DOMAIN at domains.primaryDomain
This domain does not look valid. Enter only the domain name, not a full URL.
Fix: Enter only the root domain, such as exampleeventrentals.com. Do not include https://.
Ask for help: Ask the domain owner to provide the plain host name.
```

See `fixtures/example-event-rentals.answers.json` and `fixtures/valid-full-package.answers.json` for passing examples.
