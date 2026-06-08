# Phase 2A Backlog

## Required For Implementation Plan Closure

- Create formal fixture folder plan.
- Choose JSON Schema validator library.
- Decide whether normalized status schema update happens before coding.
- Decide whether `tenant.json.owners` remains summary-only or is removed in favor of `owner-contacts.json`.
- Define deployment profile registry discovery format.
- Define deployment profile environment-variable classification rules, including public config, secret config, required fields, optional fields, and values that must never be read from protected config during offline validation.
- Define profile-specific smoke-test matrix for each supported deployment profile using fixtures only.
- Decide whether extension permission and migration schemas are validated by Phase 2A when extension manifests are present, or explicitly deferred to a later extension-validation phase.
- Define report output directory convention.

## Candidate Implementation Tasks For Later Approval

- scaffold validator package/module folder
- implement schema loader
- implement package discovery
- implement JSON parse validator
- implement schema validator
- implement cross-file validators
- implement URL safety validator
- implement secret scanner
- implement report writer
- implement deployment profile environment-variable classifier
- add CLI entrypoints
- add fixtures and tests
- add profile smoke-test fixtures
- add extension permission and migration schema fixtures if included in Phase 2A

No candidate task is approved by this planning package.
