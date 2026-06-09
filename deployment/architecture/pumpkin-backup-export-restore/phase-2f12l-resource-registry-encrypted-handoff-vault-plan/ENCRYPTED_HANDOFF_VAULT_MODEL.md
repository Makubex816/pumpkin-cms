# Encrypted Handoff Vault Model

The Build Handoff Vault is a future encrypted local-only artifact for sensitive build handoff values.

## Creation Rule

The vault must never be silently generated. It requires a separate explicit future approval that names the allowed credential categories and output location.

## Vault Contents

A future vault may contain:

- Approved credential entries
- Recipient metadata
- Approval record
- Vault manifest
- Checksums
- Rotation instructions
- Cleanup instructions
- Validation report

## Vault Exclusions

The vault must not include:

- Session cookies
- Short-lived browser tokens
- Unapproved JWTs
- Unapproved API keys
- Raw protected config files
- Normal support packet content
- Standard backup content unless separately approved as recovery escrow

## Storage

Allowed future storage:

- Outside the repo
- Ignored local output
- Private operator storage

Disallowed storage:

- Committed repo path
- Raw content-review input folder
- Standard support packet
- Public or shared unauthenticated location

## Encryption Requirements

Future implementation should use envelope encryption or equivalent:

- Per-vault generated content key
- Recipient public-key wrapping or operator passphrase flow
- Authenticated encryption
- Manifest checksum coverage
- Validation before handoff

