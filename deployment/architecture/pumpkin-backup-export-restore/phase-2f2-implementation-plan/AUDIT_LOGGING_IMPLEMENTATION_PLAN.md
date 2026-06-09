# Audit Logging Implementation Plan

## Audit Events

Record:

- job requested;
- scope resolved;
- artifact planned;
- artifact written;
- manifest written;
- checksum written;
- validation started/completed;
- restore plan requested/completed;
- escrow requested/approved/rejected;
- artifact download requested;
- artifact expired/deleted;
- failure event.

## Required Fields

- `eventId`
- `timestamp`
- `actor`
- `role`
- `action`
- `scope`
- `jobId`
- `artifactId`
- `mode`
- `status`
- `reason`
- `approvalRefs`
- `redactionStatus`

## Redaction

Audit logs must not include secret values, auth headers, cookies, tokens, connection strings, private keys, protected config contents, or decrypted escrow material.

## Phase 2F-3 Local Output

Write local audit events to:

`.tmp/<backup-id>/audit/audit-log.jsonl`

Do not stage audit output.
