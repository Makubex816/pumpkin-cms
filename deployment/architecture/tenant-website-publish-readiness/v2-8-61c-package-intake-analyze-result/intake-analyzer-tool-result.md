# Intake Analyzer Tool Result

Status: implemented.

Tool:

`deployment/architecture/pumpkin-platform/tenant-onboarding-package/v1/tools/intake-analyze-package.mjs`

Capabilities:

- ZIP path and output directory CLI.
- Ignored `.tmp` quarantine extraction.
- Cleanup by default, with optional `--keep-temp`.
- File inventory.
- Framework/tooling detection.
- Route discovery.
- Media discovery.
- Form discovery.
- Theme/brand discovery.
- Protected config filename-only detection.
- Rendering mode classification.
- Source map output for compiler work.
- Owner action packet generation.

The tool uses an internal ZIP reader for stored/deflated entries and does not run uploaded package code.
