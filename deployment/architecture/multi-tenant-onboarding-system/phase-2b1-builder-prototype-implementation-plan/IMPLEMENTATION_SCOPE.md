# Implementation Scope

## Future Prototype Objective

Implement a local/offline CLI builder that converts an answers JSON file into a validator-ready tenant import package.

## Planned In Scope

- accept `--answers <path>` pointing to a local JSON answers file
- accept `--out <path>` for a local generated package folder
- parse and validate answers before writing package files
- generate:
  - `manifest.json`
  - `tenant.json`
  - `site.json`
  - `routes.json`
  - `pages/*.json`
  - `media-assets.json`
  - `forms.json`
  - `seo.json`
  - `theme.json`
  - `redirects.json`
- use placeholders or presence flags only for runtime secrets
- enforce deterministic ID, slug, route, media ID, and form ID generation rules
- protect existing output folders unless `--overwrite` is explicitly provided
- support `--dry-run` to preview generated file list and validation intent without writing package files
- run the existing offline validator when `--validate` is provided
- export support packet when `--support-packet` is provided
- fail safely if the generated package is invalid
- document CLI usage and tests

## Planned Out Of Scope For Prototype

- interactive prompts
- Admin UI
- hosted portal
- actual CMS import
- external checks
- tenant creation
- deployment
- Search Console/indexing
- real media uploads or media copying
- runtime secret handling beyond placeholders/presence flags

## Safe Failure Rules

- If answers cannot parse, exit before generation.
- If answers fail builder validation, exit before generation.
- If output exists and `--overwrite` is not supplied, exit before writing.
- If generated package fails validator, keep generated files local but report failed status.
- If secret-like values appear in answers, redact in logs and fail before generation.
