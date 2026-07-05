# Pumpkin Backup And Onboarding Target State V2.8.60Y

Date: 2026-07-05

## Unified Target

Backup Manager and Universal Package Intake should share one principle: every tenant must be recoverable, explainable, and operator-safe before production cutover.

## Backup Target

Backups must capture database, media, packages, patches, runtime metadata, DomainBinding, resource bindings, checksums, restore runbook, and missing secret references.

## Onboarding Target

Onboarding must accept a frontend ZIP, safely inspect and render it where possible, normalize it into a Pumpkin package, validate it, and produce either a ready package or a clear owner action packet.

## Shared Gates

- No secrets in repo reports.
- Tenant ID and domain consistency.
- Responsive/mobile proof before isolated proof, production deploy, or custom-domain cutover.
- Backup readiness before risky writes.
- DNS and indexing last.

