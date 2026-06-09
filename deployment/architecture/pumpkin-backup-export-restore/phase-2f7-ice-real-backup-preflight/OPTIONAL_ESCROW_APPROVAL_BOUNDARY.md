# Optional Escrow Approval Boundary

## Decision

Ice standard backup execution does not include escrow secrets.

Recovery escrow is a separate backup mode and requires separate owner approval before any real secret is read, exported, encrypted, stored, validated, or restored.

## Escrow Preconditions

Real Ice encrypted escrow would require:

- explicit owner approval naming the escrow scope;
- approved recovery reason;
- approved secret category allowlist;
- recipient identity verification;
- recipient public key readiness;
- key rotation and revocation plan;
- encrypted output storage target;
- retention and destruction plan;
- audit record;
- separate restore approval boundary.

## Default Exclusions

Real escrow cannot include these categories by default:

- short-lived JWTs;
- session cookies;
- one-time tokens;
- personal credentials;
- browser cookies;
- local credential/cache files;
- secrets not explicitly allowlisted.

## Standard Backup Boundary

The standard backup may include only:

- escrow absence marker;
- escrow eligibility notes by category;
- no escrow payload;
- no decrypted values;
- no encrypted secret payload.

## Phase 2F-7 Boundary

No escrow payload, real secret export, recipient key generation for production, secret inventory values, escrow restore, or protected config read occurs in this phase.
