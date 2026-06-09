# Phase 2F-12L Resource Registry and Encrypted Build Handoff Vault Plan

Status: complete

This architecture package defines the resource and credential tracking layer for the Pumpkin platform.

The design separates:

- A redacted, committable Resource Registry for non-secret resource identity, wiring, ownership, tenant mapping, runtime profiles, and validation state.
- An encrypted, local-only Build Handoff Vault that may hold actual sensitive values only in a later explicitly approved phase.

No secrets were collected. No encrypted vault was created. No implementation, Azure command, CMS/API call, deployment, indexing, or live-page publication occurred.

## Why This Layer Exists

Pumpkin now has enough platform resources that operators need a durable map of what exists, which tenant it belongs to, what runtime profile uses it, what credential references are required, what should be rotated, and what must be cleaned up after build work.

The owner also needs a future downloadable handoff package that can include a complete redacted registry and, only under separate approval, an encrypted credential vault.

## Result

- Resource Registry model: defined
- Credential Reference model: defined
- Encrypted Build Handoff Vault model: defined
- Download package structure: defined
- Schema/template drafts: created with placeholders only
- Backup Center/Admin/API/Electron/tenant bundle integrations: documented
- Implementation performed: no
- Vault created: no

