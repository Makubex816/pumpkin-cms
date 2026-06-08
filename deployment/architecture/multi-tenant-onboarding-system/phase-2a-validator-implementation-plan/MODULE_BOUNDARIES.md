# Module Boundaries

This is a non-executable module plan.

## Proposed Modules

| Module | Responsibility | Inputs | Outputs |
| --- | --- | --- | --- |
| `schema-loader` | Load versioned JSON Schemas and create schema registry. | schema directory, schema version | schema registry |
| `package-discovery` | Locate package files and classify required/optional/missing files. | tenant package path | package manifest and file map |
| `json-parse-validator` | Parse JSON files with file/line-safe errors. | file map | parsed documents and parse findings |
| `schema-validator` | Validate parsed docs against schemas. | parsed docs, schema registry | schema findings |
| `cross-file-reference-validator` | Validate tenant/site consistency and references. | parsed docs | cross-file findings |
| `route-policy-validator` | Validate approved/forbidden routes and page-route coverage. | routes, pages, redirects | route findings |
| `media-reference-validator` | Validate page media references against media-assets. | pages, media-assets | media findings |
| `form-reference-validator` | Validate page form references against forms. | pages, forms | form findings |
| `seo-validator` | Validate canonical, noindex, sitemap, and robots policy fields. | site, routes, pages, seo | SEO findings |
| `url-safety-validator` | Apply URL allowlist/denylist and field-context rules. | all parsed docs, site, profile | URL findings |
| `secret-pattern-scanner` | Scan package text for secret-looking values without printing secrets. | safe package files | redacted secret findings |
| `gate-status-normalizer` | Convert raw results to normalized gate statuses. | findings, options | gate status map |
| `validation-report-writer` | Write JSON and Markdown validation reports. | status map, findings | `validation-report.json`, `VALIDATION_REPORT.md` |
| `cli-entrypoint` | Parse future command flags and call validator engine. | CLI args | exit code and report paths |

## Suggested Internal Data Types

Use stable internal records:

- `ValidationContext`
- `PackageFileMap`
- `ParsedDocumentSet`
- `SchemaRegistry`
- `ValidationFinding`
- `GateStatus`
- `ValidationReport`
- `ReportOutputOptions`

These names are planning targets only and do not create implementation files.

## Module Ordering

1. package discovery
2. JSON parse
3. schema loading
4. schema validation
5. cross-file validation
6. URL and secret scans
7. gate status normalization
8. report writing

