# Phase 2B Scope

## Objective

Design a guided builder that turns safe, plain-language user input into a deterministic tenant import package that the existing offline validator can check.

## In Scope

- guided low-skill user flow
- screen-by-screen builder specification
- field definitions and JSON path mapping
- package generation rules
- save/resume model
- validator integration model
- support packet export model
- troubleshooting UX
- access control and roles
- audit logging model
- implementation options and roadmap
- test plan and acceptance criteria

## Planning Inputs

- `wizard-design/`
- `user-walkthrough/`
- `intake-package/`
- `import-package-spec/`
- `validator-implementation/`
- `operator-runbooks/`
- `architecture-qa-audit/`
- `roadmap/`

## Phase 2B Output

The output is a planning package only. It should be detailed enough for a later implementation approval, but it must not create code, tenants, packages, or external changes.

## Required Hard Stops

- Search Console/indexing remains a final blocked gate.
- External mutation gates are outside the builder.
- Secrets are never accepted as package data.
- Roller remains paused.
