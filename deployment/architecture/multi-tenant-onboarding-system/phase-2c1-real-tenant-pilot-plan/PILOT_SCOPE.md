# Pilot Scope

## Purpose

Phase 2C-1 defines the process for selecting one real tenant candidate and preparing that candidate for a future no-mutation dry run.

The first pilot is meant to answer one question:

Can a real business provide safe, non-secret onboarding information that can be converted into a local tenant import package candidate, validated offline, reviewed by an operator, and handed back to the owner for approval without touching any live system?

## In Scope

- Select one real tenant candidate using the criteria in `CANDIDATE_SELECTION_CRITERIA.md`.
- Collect approved, non-secret tenant intake information.
- Confirm the owner understands that secrets are forbidden in intake.
- Prepare a future local answers file from approved intake.
- Generate a local import package candidate in a future separately approved dry run.
- Run the offline validator in a future separately approved dry run.
- Produce validation reports and a redacted support packet in a future separately approved dry run.
- Review the generated package, validation result, and support packet manually.
- Identify any gaps that block later import planning.

## Out Of Scope

The pilot does not create a tenant, import CMS records, write MediaAsset records, deploy anything, change DNS, configure Cloudflare, configure Azure, send email, run external checks, submit Search Console, submit a sitemap, request indexing, or resume Roller.

## Stop Point

The pilot stops when the owner and operator have reviewed the local package candidate, validator result, and support packet.

Any next action that would write to CMS, external services, production infrastructure, email systems, Search Console, or indexing requires a separate explicit approval.
