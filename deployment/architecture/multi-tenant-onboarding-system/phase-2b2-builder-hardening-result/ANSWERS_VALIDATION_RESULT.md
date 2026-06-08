# Answers Validation Result

Phase 2B-2 validates the answers file before generation and fails safely before writing package files.

## Improved Coverage

- required top-level groups
- tenant display/name/slug fields
- primary, www, and media domains
- canonical host and canonical base URL alignment
- deployment profile allowlist
- trailing slash policy
- approved and forbidden routes
- duplicate routes after normalization
- duplicate page slugs
- page route coverage
- media references and duplicate media IDs
- media safe file names
- form or forms configuration
- duplicate form IDs
- SEO noindex/default final-gate hard stop
- analytics decision records without scripts/tokens
- privacy review owner/status
- owner contacts
- manual approval gates
- URL credentials
- local/staging/default-host URLs
- local filesystem paths
- secret-like values
- paused tenant references
- unrelated tenant references

## Error Shape

Each validation error includes:

- `code`
- `path`
- `message`
- `suggestedFix`
- `askForHelp`
- `severity`

This supports lower-skill operator workflows without printing risky values.
