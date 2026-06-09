# Module Boundaries

The future prototype should stay inside a new local builder package or a clearly separated builder folder under the multi-tenant onboarding architecture area. It should reuse the existing offline validator as an integration dependency instead of duplicating validator logic.

## Planned Modules

| Module | Responsibility | Must not do |
| --- | --- | --- |
| `answers-loader` | Read answers JSON from disk, resolve path, parse JSON, return structured data. | Read protected config or external URLs. |
| `answers-validator` | Validate required answer fields, formats, routes, references, and secret-like values before generation. | Replace the offline package validator. |
| `package-generator` | Orchestrate all generator modules and output package file plan. | Call CMS, cloud, DNS, email, or Search Console. |
| `manifest-generator` | Generate package manifest and file inventory. | Authorize import or external action. |
| `tenant-generator` | Generate `tenant.json`. | Store runtime secrets. |
| `site-generator` | Generate `site.json`. | Verify or change DNS/cloud resources. |
| `route-generator` | Generate `routes.json` and route normalization. | Approve unknown routes silently. |
| `page-generator` | Generate `pages/*.json` and basic blocks. | Invent marketing claims beyond answers. |
| `media-generator` | Generate `media-assets.json`. | Copy raw images or upload media. |
| `form-generator` | Generate `forms.json`. | Configure email, Graph, webhooks, or secrets. |
| `seo-generator` | Generate `seo.json` and canonical URLs. | Submit sitemap or request indexing. |
| `theme-generator` | Generate `theme.json` navigation from approved pages. | Link to forbidden routes. |
| `redirect-generator` | Generate `redirects.json`, empty by default. | Add redirects not present in answers. |
| `validator-runner` | Invoke existing offline validator against generated package. | Perform external checks. |
| `support-packet-runner` | Invoke validator support packet output or reuse validator API. | Copy raw source package files by default. |
| `report-writer` | Write builder summary, dry-run preview, and command status. | Print secret-like values. |
| `cli` | Parse options and coordinate modules. | Implement interactive Admin UI. |

## Dependency Direction

`cli` -> `answers-loader` -> `answers-validator` -> `package-generator` -> generator modules -> `validator-runner` -> `support-packet-runner`.

Generator modules should be pure functions where practical: answer data in, file records out. File writes should be centralized so path safety and overwrite rules are enforced once.

## Non-Executable Pseudocode

```text
load answers
validate answers
plan generated package files
if dry-run, print plan and stop
verify output path safety
write package files
if validate, run offline validator
if support-packet, run support packet export
return exit code based on builder and validator status
```
