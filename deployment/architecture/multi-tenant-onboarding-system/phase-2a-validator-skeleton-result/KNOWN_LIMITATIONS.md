# Known Limitations

Phase 2A-1 is a skeleton foundation, not the full validator.

Deferred:

- deep media reference validation
- deep form reference validation
- SEO canonical/sitemap/noindex policy validation beyond schema checks
- deployment profile environment-variable classification
- profile-specific offline smoke-test fixtures
- extension permission and migration schema validation
- validation report schema alignment after normalized status vocabulary is finalized
- production-grade JSON Schema support for `$ref`, `oneOf`, `anyOf`, `allOf`, and `format`

The validator currently performs no network or external system checks by design.
