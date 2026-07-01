# Pumpkin Real Tenant Intake Readiness V2.8.54A

Date: 2026-07-01

Status: blocked_for_creation_until_partner_package_and_live_mutation_approval

## Current Decision

Pumpkin is ready to receive a partner real tenant package for read-only validation and Admin UI mapping. Pumpkin is not approved to create the partner tenant yet.

Creation blockers:

- Partner updated real tenant package has not been provided in this phase.
- Secure handoff for creation is not part of this V2.8.54A audit.
- Live record mutation approval is absent.
- Media upload, deploy, DNS, and indexing approvals are absent.
- The old secondary package must not be used for creation.

## Required Partner Package Data

- Tenant identity and owner/operator contacts.
- Domains and desired canonical host.
- Brand/theme values and visual assets.
- Page list, slugs, metadata, redirects, and content.
- Media manifest with file references and alt text.
- Form definitions and readback expectations.
- Admin/operator user role requirements.
- Publish target and runtime health expectations.
- External compatibility declarations.

## Required Secure Handoff Data

Credential and provider material must remain outside repo reports and package files. It may be read only in a separately approved phase and only from an approved ignored secure path.

## Read-Only Preflight To Run When Package Arrives

1. Confirm the supplied path is the new partner package, not the old secondary candidate.
2. Run the package validator.
3. Map package sections to Admin UI feature coverage.
4. Confirm V2.8.53S external compatibility constraints.
5. Confirm no credential values are present in repo package files.
6. Produce a creation readiness decision.
7. Stop before any live write unless a separate approval grants it.

## UI Gap Impacts

- `/dashboard/leads` is missing; current readback route is `/dashboard/forms`.
- Tenant creation is not package-aware in Admin UI.
- External compatibility checks are durable-doc/API based rather than a visible onboarding checklist.
- DNS/indexing/deploy remain runbook-gated rather than Admin UI driven.

