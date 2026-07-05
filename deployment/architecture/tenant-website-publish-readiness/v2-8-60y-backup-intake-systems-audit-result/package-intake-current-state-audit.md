# Package Intake Current-State Audit

## Existing Assets

Current package intake assets include:

- V1 tenant onboarding package spec, schemas, examples, and validator.
- Package-to-live mapping.
- Security boundary and execution runbooks.
- Content JSON package staging in Admin UI.
- Import/Export dry-run and import history workflow.
- ImportRun and PublishRun API/storage surfaces.
- Read-only import-intake preview API backed by local fixtures.
- Admin Import Intake Preview UI with disabled future actions.
- Operator handoff read-only surfaces.
- V2.8.60V responsive route schema and GET-only responsive checker.

## What Works Today

- A prepared V1 Pumpkin package can be validated locally.
- Content JSON can be staged and handed off to Import/Export workflows.
- ImportRun records can capture import dry-run/result audit information.
- PublishRun records can capture static publish metadata.
- Import-intake packages can be previewed in a GET-only Admin UI from fixtures/API bridge.
- Responsive declarations and browser proof can be run against a base URL.

## What Is Still Manual

- Raw frontend ZIP intake.
- Framework classification.
- Copied-workspace dependency install/build/render decisions.
- Route discovery.
- Media discovery and mapping.
- Form detection and FormDefinition mapping.
- Brand/theme extraction.
- Domain and tenant ID normalization.
- Source secret/template detection.
- Conversion to V1 Pumpkin package.
- Owner action packet writing.

Airstrip completed these steps through controlled Codex phases, not through an operator upload wizard.

## Current Gap

The platform has the package destination format and validation gates. It does not yet have the universal package compiler that transforms an arbitrary frontend ZIP into that destination format.

