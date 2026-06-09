# Escrow Recipient And Key Management

## Recipient Model

Escrow recipients are approved identities that can decrypt recovery escrow material. A recipient record contains public-key metadata, custody role, expiry, rotation status, and approval scope. It does not contain private keys.

## Recipient Types

- Owner recovery recipient.
- Technical operator recovery recipient.
- Platform emergency recipient.
- Break-glass recipient, disabled by default.

## Public Key Requirements

- Public keys must be stored with fingerprint, algorithm, creation date, expiry, owner, and approval scope.
- Private keys never enter Pumpkin docs, git, standard backups, or support packets.
- Recipient keys are rotated on a schedule and immediately after suspected compromise.

## Custody

Recovery key custody must be documented outside git in an owner-approved secure location. The Backup Center stores references and fingerprints, not private keys.

## Multi-Party Option

Full platform recovery escrow should support optional multi-party approval and multi-recipient encryption so no single operator silently creates or restores platform-wide secret escrow.
