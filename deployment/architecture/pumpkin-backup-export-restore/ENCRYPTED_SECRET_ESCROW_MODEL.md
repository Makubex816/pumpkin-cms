# Encrypted Secret Escrow Model

## First-Class Flow

Encrypted secret escrow is part of the main Backup Center build flow. It is not a later add-on, because validated recovery may require selected runtime credentials. The system must design normal backups and recovery escrow together so the normal path cannot accidentally absorb secrets.

## Recommended Encryption Model

Use envelope encryption or recipient public-key encryption:

1. Generate a random data encryption key in private job memory.
2. Encrypt the allowlisted secret payload with authenticated encryption.
3. Encrypt the data key to approved recipient public keys or a managed key-encryption key.
4. Store only encrypted payload, recipient metadata, approval record, and checksums.
5. Destroy plaintext from process memory as soon as practical.

## Plaintext Rules

- No plaintext escrow file is written to public, static, git, support-packet, or browser-download directories.
- No secret value appears in logs, manifests, screenshots, summaries, or validation output.
- Test/development escrow uses fake secrets only.

## Allowlist Rule

Only explicitly allowlisted categories may be included. Unknown secret categories are excluded until the architecture and approval policy are updated.

## Compromise Response

If an escrow recipient key is compromised:

- revoke the recipient key;
- mark existing escrow artifacts requiring that key as at-risk;
- rotate affected runtime secrets where feasible;
- reissue escrow with new recipient keys after approval;
- audit all download and restore attempts.

## Future Enhancements

- Multi-party approval.
- Hardware/security key-backed recipient keys.
- Managed HSM or cloud KMS integration.
- Split knowledge for platform-wide recovery escrow.
