# Escrow Restore Workflow

## Separate Approval

Escrow restore is separate from escrow creation. Having an encrypted escrow artifact does not authorize decrypting or applying it.

## Restore Approval Requires

- incident or recovery reason;
- scope and target environment;
- artifact ID and checksum;
- recipient identity and key fingerprint;
- owner/operator approval;
- sandbox restore attempt unless emergency policy explicitly overrides;
- post-restore rotation plan where appropriate.

## Restore Steps

1. Validate escrow manifest and checksums.
2. Confirm approval and recipient authorization.
3. Decrypt only in private restore workspace.
4. Restore only selected approved categories.
5. Write no plaintext values to logs.
6. Run readback or presence-only verification.
7. Audit outcome and cleanup private workspace.

## Hard Stops

- Do not restore secrets into production as part of backup validation.
- Do not restore short-lived tokens, sessions, auth headers, cookies, or personal credentials.
- Do not use escrow restore to bypass normal credential rotation or owner approval.
