# Answers File Format

The answers file is a local, non-secret JSON file. It is intended for fake or operator-prepared intake answers only; it must not contain passwords, API keys, private keys, tokens, signed URLs, local filesystem paths, local URLs, staging URLs, preview URLs, or paused tenant references.

## Required Top-Level Fields

| Field | Purpose |
| --- | --- |
| `schemaVersion` | Must be `1.0.0`. |
| `tenant` | Tenant identity and display metadata. |
| `domains` | Production-shaped public domains for generated package references. |
| `builderProfile` | Local package generation profile. |
| `routing` | Approved and forbidden routes. |
| `pages` | Page answers for every approved route. |
| `media` | Declared media assets; can be an empty array. |
| `form` | Single contact form configuration for the skeleton phase. |
| `seo` | Robots, sitemap policy, and indexing final gate. |

## Tenant Fields

| Field | Rule |
| --- | --- |
| `tenantId` | Lowercase letters, numbers, and hyphens; 3-63 characters. |
| `siteKey` | Lowercase letters, numbers, and hyphens; 3-63 characters. |
| `tenantDisplayName` | Required display name. |
| `businessType` | Required business category. |
| `cmsTenantSlug` | Lowercase letters, numbers, and hyphens; 3-63 characters. |

## Domain Fields

| Field | Rule |
| --- | --- |
| `primaryDomain` | Public production-shaped domain. |
| `wwwDomain` | Public production-shaped domain. |
| `mediaDomain` | Public production-shaped domain. |
| `canonicalHost` | `primary` or `www`. |

## Routing Fields

Routes must start with `/` and use lowercase letters, numbers, and hyphens. Non-root routes are normalized with a trailing slash in the generated package.

Every approved route must have a matching page answer. A route cannot appear in both `approvedRoutes` and `forbiddenRoutes`.

## Page Fields

| Field | Rule |
| --- | --- |
| `route` | Must match an approved route. |
| `slug` | Optional; generated from route when omitted. |
| `title` | Required. |
| `navLabel` | Optional navigation label. |
| `seoDescription` | Required by the generated page schema. |
| `mediaRefs` | Optional media IDs declared in `media`. |
| `formRef` | Optional form ID matching `form.formId`. |

## Secret And URL Guardrails

The builder rejects answers that look like:

- private keys
- JWTs
- AWS access key IDs
- `client_secret`, `access_token`, `api_key`, `password`, or similar assignments
- signed URL query parameters
- local paths such as `C:\...`, UNC paths, or `file://...`
- URLs on local, staging, preview, default-host, or platform-generated hosts

See `fixtures/example-event-rentals.answers.json` for a passing example.
