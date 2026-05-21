# Import Run Registry

Phase 6Q adds a tenant-scoped ImportRun registry for import dry-run and import result audit records.

## What An ImportRun Is

An ImportRun is a CMS-side audit record for an import attempt or dry-run. It records safe metadata such as:

- tenantId
- importRunId
- source type
- staged package metadata when available
- import mode
- validation summary
- diff summary
- import result summary
- affected page references
- revision counts
- warning/error counts
- confirmation gate acknowledgements

It does not execute imports. It does not deploy static output. It does not purge Cloudflare.

## Validation, Staging, Diff, Import, And History

- Content Validator checks whether JSON follows the page/template contract.
- Content Package Staging stores package review metadata in browser localStorage.
- Import Diff previews how incoming JSON compares with current CMS pages.
- Import/Export is still the only bulk page write path.
- Import History stores the dry-run or import result after the admin intentionally saves it.

## Safe To Store

The registry stores sanitized summaries and affected-page references:

- page slug/title/action
- create/update/skip/error counts
- validation and diff counts
- warning/error messages
- staged package id/name/source label
- confirmation gate acknowledgement flags

## Not Stored

ImportRun records must not store:

- API keys
- connection strings
- `.env` content or paths
- `appsettings.Development.json` content or paths
- Azure or Cloudflare tokens
- full protected configuration
- arbitrary local filesystem paths

## Cosmos Container

Local and production Cosmos setups need:

- Container: `ImportRun`
- Partition key: `/tenantId`

If the container is missing, the admin API returns a clear setup-oriented error. Create the container before using CMS-backed import history.

## Rollback And Static Rebuild Review

ImportRun records help operators verify that update imports created revisions and identify pages that should be treated as needing static rebuild. The registry does not itself roll pages back and does not clear static publishing flags.

## Current Limits

- ImportRun stores summaries, not full content snapshots.
- Notes/status patching is deferred.
- CSV/XLSX audit records are supported through the same result summary shape, but JSON remains the preferred production content package format.
- Real deployment history is tracked separately by PublishRun.
