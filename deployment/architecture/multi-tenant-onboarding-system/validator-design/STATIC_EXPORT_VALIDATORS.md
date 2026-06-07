# Static Export Validators

Validate:

- exported routes match approved routes
- preview/obsolete output paths are absent
- sitemap exists only when profile expects it
- sitemap URLs match canonical URLs
- robots policy matches gate state
- no unexpected noindex on approved production pages
- no hidden draft/review/admin payloads
- no localhost, staging, or local media paths in production output
- no generated artifacts are staged
- no unrelated tenant strings appear

Static export validators should produce both operator detail and owner-friendly summaries.

