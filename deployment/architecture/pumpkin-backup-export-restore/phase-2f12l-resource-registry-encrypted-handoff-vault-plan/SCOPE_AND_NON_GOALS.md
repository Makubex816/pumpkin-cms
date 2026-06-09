# Scope and Non-Goals

## Approved Scope

- Design the redacted Resource Registry architecture.
- Design the encrypted Build Handoff Vault architecture.
- Define data models for resources, credentials, tenants, profiles, ownership, and attachments.
- Define committable versus never-committable boundaries.
- Define downloadable handoff package structure.
- Define validation, checksum, rotation, cleanup, and audit plans.
- Define Backup Center, tenant bundle, Admin/API, and Electron integration.
- Create schema/template drafts with placeholders only.

## Non-Goals

- No implementation.
- No secret collection.
- No key export.
- No encrypted vault creation.
- No plaintext credential file creation.
- No protected config reads.
- No Azure commands.
- No CMS/API calls.
- No CMS writes.
- No database export.
- No Cosmos export.
- No media/blob download.
- No deployment.
- No Search Console or indexing.
- No live-page publication.

## Boundary Rule

The registry may record that a credential reference exists. It must not store the credential value. Actual sensitive values may only be written to a future encrypted local-only handoff vault after a separate explicit approval.

