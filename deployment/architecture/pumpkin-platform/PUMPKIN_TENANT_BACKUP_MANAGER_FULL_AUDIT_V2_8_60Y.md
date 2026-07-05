# Pumpkin Tenant Backup Manager Full Audit V2.8.60Y

Date: 2026-07-05

## Current State

Pumpkin has a local/operator Backup Center prototype and a proven Ice protected backup bundle. It can generate standard backup bundles, validate manifests and checksums, produce restore plans, include redacted Resource Registry references, and use approved live-readonly proof paths for Ice.

It does not yet have a production Backup Manager UI/API, backup job queue, durable artifact store, retention service, or live restore adapter.

## Owner Target

Backup Manager must let a SuperAdmin/operator request a tenant backup that captures all recovery inputs:

- database records;
- media records and blobs;
- original uploaded package;
- normalized Pumpkin package;
- source patches and overlays;
- build/deploy metadata and safe rebuild inputs;
- DomainBinding state;
- resource bindings;
- checksums;
- restore runbook;
- missing secret report with outside-repo hardcopy references only.

## Required Build

Build the backup system in layers:

1. Refresh backup contract.
2. Add BackupRequest/BackupRun models.
3. Add SuperAdmin read-only UI/API preview.
4. Add local/dry-run execution.
5. Add production queue/worker only after separate approval.
6. Add restore dry-run service.
7. Keep live restore separately gated.

