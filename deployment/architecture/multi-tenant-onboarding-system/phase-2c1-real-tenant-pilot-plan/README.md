# Phase 2C-1 Real Tenant Pilot Plan

This package defines the first real tenant pilot process for the multi-tenant onboarding system.

It is a planning package only. It does not authorize tenant creation, CMS writes, Azure changes, Cloudflare or DNS changes, deployment, email sending, Search Console work, indexing requests, external checks, or Roller activity.

## Planning Status

| Area | Status |
| --- | --- |
| Phase 2B-5 form recipient alignment | complete |
| Phase 2C-1 real tenant pilot planning | complete |
| Ready for real tenant dry-run approval | yes, conditional on approved non-secret candidate intake and passing local builder/validator checks before the dry run |
| Ready for real tenant execution | no |
| New tenant created | no |
| External systems changed | no |
| Search Console or indexing affected | no |
| Roller | paused |

## Pilot Objective

The first real tenant pilot should prove that approved real business information can move through the local builder, offline validator, support packet, operator review, and owner review without changing production systems.

The pilot stops before CMS import, tenant creation, deployment, DNS, Cloudflare, Azure, email, Search Console, indexing, or monitoring setup.

## Package Contents

- `PILOT_SCOPE.md` defines the allowed pilot outcome.
- `NON_GOALS.md` lists actions that remain explicitly out of scope.
- `CANDIDATE_SELECTION_CRITERIA.md` defines the safest first tenant profile.
- `PILOT_INTAKE_REQUIREMENTS.md` defines how intake is collected and approved.
- `REQUIRED_USER_SUPPLIED_INFORMATION.md` lists the non-secret information needed from the owner.
- `FORBIDDEN_USER_SUPPLIED_INFORMATION.md` lists information that must not be supplied.
- `NO_MUTATION_DRY_RUN_PLAN.md` defines the dry-run sequence and stop point.
- `BUILDER_VALIDATOR_WORKFLOW.md` maps builder, validator, and report expectations.
- `SUPPORT_PACKET_REVIEW_PLAN.md` defines support packet review and redaction.
- `OPERATOR_REVIEW_CHECKLIST.md` gives the operator a step-by-step review checklist.
- `APPROVAL_BOUNDARIES.md` separates every approval gate.
- `ROLLBACK_AND_ABORT_PLAN.md` defines abort rules and no-mutation rollback handling.
- `RISK_REGISTER.md` records first-pilot risks and mitigations.
- `READINESS_GATE_BEFORE_EXECUTION.md` defines the future execution gate.
- `NEXT_REAL_TENANT_DRY_RUN_APPROVAL_PROMPT.md` provides the next approval prompt.
- `manifest.json` summarizes artifacts, readiness, and boundaries.

## Boundary Confirmation

This package only prepares for a future no-mutation real tenant dry run. It does not request or perform external checks, import content, create a tenant, submit Search Console, submit a sitemap, request indexing, send email, change DNS, change Cloudflare, change Azure, change CMS data, change MediaAsset records, deploy code, or resume Roller.
