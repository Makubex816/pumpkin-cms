# Known Limitations

- This is a local file-based builder, not an interactive wizard.
- It accepts one answers JSON file instead of collecting answers through forms.
- It does not create tenants or import content.
- It does not upload media files or verify that media URLs resolve.
- It does not perform external checks.
- It does not read protected local config.
- It does not manage runtime secrets; generated packages use placeholders only.
- It does not submit sitemaps, request indexing, or use Search Console.
- It does not perform DNS, Azure, Cloudflare, Function setting, or deployment work.
- It does not send email or Microsoft 365 messages.
- It does not perform Roller work; Roller remains paused.
- It does not currently implement `--version`.
- It implements preview/diff as a safe summary, not a line-by-line file diff.
- The answers schema is enforced by local validation functions, not by a published JSON Schema.
- Catalog fields for owner contacts and approvals are validated and summarized but not emitted as extra package JSON until those schemas are part of the validator's required package discovery.
- Custom page block validation is partly handled by the builder and partly handled by the existing offline validator.
