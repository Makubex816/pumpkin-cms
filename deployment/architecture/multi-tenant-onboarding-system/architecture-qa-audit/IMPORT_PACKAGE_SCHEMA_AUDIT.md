# Import Package and Schema Audit

## Strengths

- Core package shape is clear.
- Schemas exist for tenant, site, routes, pages, media assets, forms, SEO, theme, redirects, and manifest.
- Forbidden values and troubleshooting docs are present.
- Generic templates avoid real secrets.

## Gaps Found

| Gap | Severity | Recommended fix | Status |
| --- | --- | --- | --- |
| Owner contacts were only Markdown intake, not JSON contract | P0 | Add owner contacts expectations, schema, and template. | applied |
| Approvals were only Markdown intake, not JSON contract | P0 | Add approvals expectations, schema, and template. | applied |
| Validation report was not schema-backed | P1 | Add validation report expectations, schema, and JSON template. | applied |
| Support packet was not schema-backed | P1 | Add support packet expectations, schema, and JSON template. | applied |
| Cross-file references are described but not expressible in JSON Schema alone | P1 | Implement cross-file validators in Phase 2. | recommended |
| URL safety needs validators beyond JSON Schema `format` | P1 | Implement URL denylist/allowlist validators in Phase 2. | recommended |
| Theme navigation allows external URLs without structured approval | P2 | Add external link approval model before implementation. | recommended |

## Schema Verdict

Schema draft readiness improved from "partial" to "implementation-planning ready." Cross-file and URL safety still require custom validators.
