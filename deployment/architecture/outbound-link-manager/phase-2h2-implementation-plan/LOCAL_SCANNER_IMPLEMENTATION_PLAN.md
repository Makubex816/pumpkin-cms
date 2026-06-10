# Local Scanner Implementation Plan

Recommended first batch: Phase 2H-3.

## Inputs

- fixture page JSON;
- fixture rich text blocks;
- fixture navigation/footer/theme data;
- fixture import package;
- fixture backup bundle;
- existing architecture templates.

## Pipeline

```text
load source
  -> discover declared link-bearing fields
  -> extract URLs
  -> normalize URL
  -> classify domain policy
  -> build or match registry record
  -> build instance record
  -> diff against previous registry fixture
  -> validate schemas
  -> write reports under .tmp
```

## Non-Negotiable Rules

- No external URL fetch.
- No CMS/API calls.
- No protected config reads.
- No writes outside ignored `.tmp`.
- No generated artifacts staged.

## First Supported Extractors

- structured fields named `url`, `href`, `ctaUrl`, and `linkUrl`;
- rich text Markdown links;
- simple HTML anchor tags in trusted fixture rich text;
- navigation item `href`;
- footer/social URL arrays.

## Reports

Phase 2H-3 should write:

- `outbound-link-scan-run.json`;
- `outbound-links.proposed.json`;
- `outbound-link-instances.proposed.json`;
- `outbound-link-validation-report.json`;
- `OUTBOUND_LINK_VALIDATION_REPORT.md`.
