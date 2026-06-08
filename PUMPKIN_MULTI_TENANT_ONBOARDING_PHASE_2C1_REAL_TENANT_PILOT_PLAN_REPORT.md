# Pumpkin Multi-Tenant Onboarding Phase 2C-1 Real Tenant Pilot Plan Report

## Summary

Phase 2C-1 defines the first real tenant pilot process for the multi-tenant onboarding system.

This is a planning-only package. It prepares the candidate selection, intake, dry-run, validation, support packet, owner review, approval boundary, and abort model for a later separately approved no-mutation dry run.

No real tenant was created. No CMS, Azure, Cloudflare, DNS, deployment, email, Search Console, indexing, external check, or Roller action was performed.

## Package Created

Created:

- `deployment/architecture/multi-tenant-onboarding-system/phase-2c1-real-tenant-pilot-plan/README.md`
- `deployment/architecture/multi-tenant-onboarding-system/phase-2c1-real-tenant-pilot-plan/PILOT_SCOPE.md`
- `deployment/architecture/multi-tenant-onboarding-system/phase-2c1-real-tenant-pilot-plan/NON_GOALS.md`
- `deployment/architecture/multi-tenant-onboarding-system/phase-2c1-real-tenant-pilot-plan/CANDIDATE_SELECTION_CRITERIA.md`
- `deployment/architecture/multi-tenant-onboarding-system/phase-2c1-real-tenant-pilot-plan/PILOT_INTAKE_REQUIREMENTS.md`
- `deployment/architecture/multi-tenant-onboarding-system/phase-2c1-real-tenant-pilot-plan/REQUIRED_USER_SUPPLIED_INFORMATION.md`
- `deployment/architecture/multi-tenant-onboarding-system/phase-2c1-real-tenant-pilot-plan/FORBIDDEN_USER_SUPPLIED_INFORMATION.md`
- `deployment/architecture/multi-tenant-onboarding-system/phase-2c1-real-tenant-pilot-plan/NO_MUTATION_DRY_RUN_PLAN.md`
- `deployment/architecture/multi-tenant-onboarding-system/phase-2c1-real-tenant-pilot-plan/BUILDER_VALIDATOR_WORKFLOW.md`
- `deployment/architecture/multi-tenant-onboarding-system/phase-2c1-real-tenant-pilot-plan/SUPPORT_PACKET_REVIEW_PLAN.md`
- `deployment/architecture/multi-tenant-onboarding-system/phase-2c1-real-tenant-pilot-plan/OPERATOR_REVIEW_CHECKLIST.md`
- `deployment/architecture/multi-tenant-onboarding-system/phase-2c1-real-tenant-pilot-plan/APPROVAL_BOUNDARIES.md`
- `deployment/architecture/multi-tenant-onboarding-system/phase-2c1-real-tenant-pilot-plan/ROLLBACK_AND_ABORT_PLAN.md`
- `deployment/architecture/multi-tenant-onboarding-system/phase-2c1-real-tenant-pilot-plan/RISK_REGISTER.md`
- `deployment/architecture/multi-tenant-onboarding-system/phase-2c1-real-tenant-pilot-plan/READINESS_GATE_BEFORE_EXECUTION.md`
- `deployment/architecture/multi-tenant-onboarding-system/phase-2c1-real-tenant-pilot-plan/NEXT_REAL_TENANT_DRY_RUN_APPROVAL_PROMPT.md`
- `deployment/architecture/multi-tenant-onboarding-system/phase-2c1-real-tenant-pilot-plan/manifest.json`

## Why Planning Comes Before The Dry Run

The first real tenant pilot introduces real business and domain information. Even without external writes, that raises review risk around secrets, private customer data, media rights, form recipients, legal/privacy status, owner approvals, and premature indexing.

Planning first keeps the next phase narrow: one local/offline dry run, one candidate, non-secret approved intake, redacted support packet, explicit stop before mutation, and no implied approval for execution.

## Candidate Selection

The first candidate should be a low-complexity brochure-style tenant with:

- one clear business owner
- simple public routes
- known domain intent or approved placeholders
- approved media or placeholders
- one clear lead recipient reference
- low legal/privacy complexity
- no urgent launch deadline
- no dependency on live external integrations
- no Roller dependency unless later explicitly approved

## Intake Requirements

The pilot requires non-secret owner-supplied information for:

- tenant identity and owner contacts
- domain and `www` preference
- approved route list
- content source
- media inventory and rights status
- `leadRecipientRef` and legacy `recipientGroup` compatibility where needed
- mailbox owner and form oversight owner
- legal/privacy review status
- analytics decision
- monitoring owner
- rollback owner
- final indexing owner
- deployment profile preference if known

Forbidden intake includes secrets, credentials, tokenized URLs, protected local paths, private customer data, mailbox contents, form submissions, and deployment or platform tokens.

## No-Mutation Dry-Run Process

The later dry run should:

1. use approved non-secret intake
2. create a local answers file
3. generate a local import package candidate
4. run the offline validator
5. export validation reports and a redacted support packet
6. complete operator review
7. complete owner review
8. document blockers and gaps
9. stop before CMS import, tenant creation, deployment, external checks, email, Search Console, indexing, or Roller work

## Approval Boundaries

The package separates these approvals:

- candidate selection
- real non-secret intake
- local package dry run
- owner and operator review
- CMS import planning
- CMS preview import
- deployment profile planning
- deployment execution
- final Search Console and indexing
- Roller-specific work

Approval of an earlier gate does not authorize a later gate.

## Rollback And Abort

Because Phase 2C-1 and the future dry run are no-mutation phases, rollback means stopping and preserving or deleting local artifacts as directed.

Abort immediately if secrets, private customer data, protected paths, blocked validation, failed validation, redaction failure, external mutation requests, premature indexing requests, or Roller changes appear inside the dry-run gate.

## Readiness Classification

| Area | Status |
| --- | --- |
| Phase 2B-5 form recipient alignment | complete |
| Phase 2C-1 real tenant pilot planning | yes |
| Ready for real tenant dry-run approval | yes, conditional on approved non-secret candidate intake and passing local builder/validator checks before the dry run |
| Ready for real tenant execution | no |
| New tenant created | no |
| External systems changed | no |
| Search Console or indexing affected | no |
| Roller | paused |

## Boundary Confirmation

- No Search Console submission.
- No indexing request.
- No sitemap submission.
- No DNS change.
- No Cloudflare change.
- No Azure change.
- No CMS change.
- No MediaAsset change.
- No Function App change.
- No deployment.
- No email sending.
- No external checks.
- No real tenant creation.
- Roller remains paused.
