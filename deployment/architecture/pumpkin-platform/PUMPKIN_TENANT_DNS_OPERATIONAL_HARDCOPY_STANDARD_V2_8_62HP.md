# Pumpkin Tenant DNS Operational Hardcopy Standard V2.8.62HP

Tenant DNS operations that depend on customer-controlled registrar action require a durable outside-repository hardcopy before the lane is paused.

## Required Model

The packet must identify the tenant, apex and WWW domains, association ID, Azure zone/resource group/resource ID, current nameservers, target nameservers, staged-record metadata, rollback values, pause status, and exact resume conditions.

It must include:

- a machine-readable hold record;
- a manual registrar packet;
- a resume checklist;
- an unconfirmed manual-change template;
- a fresh public DNS snapshot;
- a fresh Azure zone readback;
- a checksum manifest;
- a human-readable README.

The separate metadata-only DNS operations register must use association ID as the unique key, retain historical status events, preserve unrelated entries, and contain exactly one active entry for a tenant/domain association.

## Atomicity

Build the complete packet in a sibling temporary directory. Parse JSON, verify required fields and exact file count, compute hashes, scan for prohibited material, and apply restricted ACLs before an atomic same-volume rename publishes the final directory.

Build register updates in a sibling temporary file. Parse and validate uniqueness before atomic replacement. Back up a pre-existing register before replacement. Never delete an interrupted packet; preserve it under a timestamped sibling name before rebuilding.

## ACL Contract

Disable inherited access on the hardcopy directory, every hardcopy file, and the DNS operations register. Allow FullControl only to:

- the current Windows operator;
- SYSTEM;
- local Administrators.

Do not loosen parent-directory permissions.

## Integrity and Security

SHA-256 must cover the hold JSON, manual packet, resume checklist, confirmation template, public DNS snapshot, Azure readback, and DNS operations register. Self-referential hashes belong in the external checksum manifest.

Do not store or print passwords, JWTs, cookies, API keys, runtime-key plaintext, connection strings, SAS values, storage keys, appsetting values, or custom-header authentication values. Verification TXT contents should be represented by nonempty state and safe hash when exact plaintext is unnecessary.

Repository evidence may contain paths, filenames, public DNS values, non-secret identifiers, statuses, timestamps, counts, and hashes only. Secure hardcopy contents must never be staged.
