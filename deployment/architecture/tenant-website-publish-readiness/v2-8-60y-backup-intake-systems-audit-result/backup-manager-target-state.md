# Backup Manager Target State

## Product Shape

Backup Manager should be a SuperAdmin-only and operator-friendly workflow for creating, validating, downloading, and using tenant recovery packages.

## Required Backup Request Behavior

A backup request must export or copy:

- tenant database records;
- tenant user records with credential recovery handled separately;
- pages and route metadata;
- media asset records;
- media blobs and media manifest;
- themes;
- FormDefinitions;
- protected FormEntries;
- ImportRuns;
- PublishRuns;
- DomainBinding records and DNS packet state;
- original uploaded frontend package when available;
- normalized Pumpkin tenant package;
- source patches/overlays;
- build and deploy artifact metadata;
- safe rebuild inputs when available;
- resource binding map;
- monitoring/diagnostic binding references;
- checksum manifest;
- restore runbook;
- restore validation checklist;
- missing/nonrecoverable secret report.

## Secret Handling

Repo reports and standard backup manifests must never contain secret values. Secret recovery must use:

- outside-repo secure hardcopy references;
- ignored secure handoff files for approved phases;
- redacted presence/readiness status in reports;
- explicit missing-secret classification if the secret is unavailable.

## Operator UX

The non-technical operator should see plain states:

- Ready to back up.
- Backup running.
- Backup created.
- Validate backup.
- Restore dry-run passed.
- Missing recovery items.
- Needs secure handoff.
- Not safe to restore live.
- Ready for approved restore phase.

## Restore Target

The target state does not make restore automatic. Restore remains a separate approval with exact target, mutation scope, privacy handling, identity plan, secret handoff, rollback, and no-regression proof.

