# Admin UI Design

This is a future Admin design. No Admin UI implementation is approved in Phase 2H-1.

## Screens

## Outbound Links Dashboard

Primary operator surface for search and triage.

Filters:

- tenant;
- site;
- URL;
- domain;
- status;
- page;
- anchor text;
- first detected date;
- last detected date;
- disabled date;
- review-required flag.

Columns:

- normalized URL;
- domain;
- status;
- instance count;
- pages affected;
- first detected;
- last detected;
- last action;
- quick actions.

## Link Detail

Shows canonical URL, original examples, status, domain policy, instance counts, audit history, and related scan runs.

## Usage / Instances View

Lists every placement with page, route, block, field path, anchor text, instance status, and last detection timestamp.

## Domain Management

Allows future tenant-scoped allow/block/review policy management. Bulk domain actions require preview and explicit confirmation.

## Bulk Actions

Supports preview-first workflows:

- disable all links for a domain;
- mark selected links pending review;
- enable selected instances;
- convert selected instances to plain text;
- archive stale links.

## Scan Run History

Shows source, mode, status, counts, warnings, and whether the scan was local, import-package, backup-bundle, or approved live-readonly.

## Audit Log

Read-only chronological record with actor, action, target, previous value, new value, reason, and timestamp.

## Tenant Policy Settings

Configures default disabled behavior, rel behavior, target behavior, allow/block domain lists, and review-required behavior.

## Review Queue

Focused view for links and domains requiring owner/operator review before publication.
