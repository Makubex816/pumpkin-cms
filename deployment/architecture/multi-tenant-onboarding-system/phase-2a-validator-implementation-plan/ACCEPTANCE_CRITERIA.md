# Acceptance Criteria

Future Phase 2A implementation should not be accepted until:

- validator runs fully offline
- all schemas load from the schema registry
- schema version mismatch is detected
- valid example package passes
- invalid fixtures fail deterministically
- cross-file references are validated
- route allowlist and forbidden route checks pass/fail correctly
- media references are validated
- form references are validated
- canonical/noindex/sitemap policy checks run
- deployment profile environment-variable classification is validated without reading protected config
- profile-specific smoke-test fixtures run offline
- extension permission and migration schema handling is either validated or explicitly deferred with a blocking follow-up
- URL safety rules catch forbidden URLs
- secret-looking values are detected without printing values
- normalized gate statuses are used consistently
- `validation-report.json` is generated
- `VALIDATION_REPORT.md` is generated
- CLI exit code policy is documented and tested
- non-technical error messages are useful and snapshot-tested
- no external systems are touched
- no protected config is read
- no secrets are printed
- docs explain how non-technical users fix common errors

## Non-Acceptance Conditions

Reject Phase 2A implementation if:

- it requires network access
- it mutates CMS, MediaAsset, Azure, Cloudflare, DNS, Function settings, email, Microsoft 365, Search Console, or Roller
- it prints secret values
- it silently ignores schema mismatch
- it accepts unapproved routes in page files
- it treats deployment profile secrets as public config
- it treats Search Console readiness as indexing approval
