# IceSkatingRinkRentals.com Phase 8C.7 Review Bundle

This bundle is for IceSkatingRinkRentals.com only.

RollerRinkRentals.com remains paused. Do not use this bundle to advance Roller content, deployment, or launch planning.

## Purpose

This is a human editing and approval handoff for the Phase 8C.6 design-system templates.

No CMS import has happened.

No live CMS Page records have been changed.

No live CMS Theme records have been changed.

No static regeneration has happened.

No deployment, Azure resource, Cloudflare, DNS, custom-domain, workflow, or production cutover action has happened.

## Included Templates

- `ice-homepage.design-system.template.json`
- `ice-contact.design-system.template.json`
- `ice-service-areas.design-system.template.json`
- `ice-launch-template-package.design-system.json`

## Handoff Documents

- `README.md`
- `REVIEW_CHECKLIST.md`
- `PLACEHOLDERS_TO_RESOLVE.md`
- `APPROVAL_GATE.md`
- `manifest.json`

## Route Decisions

Canonical service-area route:

- `/service-areas`

Future alias candidate only:

- `/areas-served`

Do not create a duplicate `/areas-served` content page. Treat it only as a future redirect or alias candidate after route review.

## City Page Status

The targeted city/location page is not included yet.

No city/location page should be created until the specific city, state, region, route, service-area wording, and indexing decision are approved.

## Review Workflow

1. Review copy, design intent, SEO, schema notes, CTAs, form metadata, service-area wording, and placeholders.
2. Edit the copied JSON files in this bundle if revisions are needed.
3. Re-run design-system validation after edits.
4. Resolve or explicitly block every placeholder listed in `PLACEHOLDERS_TO_RESOLVE.md`.
5. Record approvals using `APPROVAL_GATE.md`.
6. Only after approval, move to a separate CMS import preflight phase.

## Import Warning

Do not import this bundle into CMS during Phase 8C.7.

Before any future CMS write, run admin import/export preflight in dry-run mode and confirm reviewer approval is documented.
