# Pumpkin API Read-Only Contract Plan

Status: future boundary required.

## Proposed Future Contract

A future Pumpkin API endpoint may expose the viewer model as read-only data after an explicit approval.

## Required API Constraints

- GET-only endpoint.
- No provider writes.
- No CMS writes.
- No Azure writes.
- No protected config reads.
- No token, key, connection string, or SAS material in responses.
- No Google/Search Console/indexing action.
- No live crawl or outbound link action.
- No contact form submission.

## Proposed Response Shape

The response should match `audit-job-ledger-viewer.v1` and preserve `summary`, `panels`, detail rows, trace IDs, warnings, blockers, next gates, and security boundary.

## Not Approved In V2.9.3

No API endpoint was created in this phase.
