# Encrypted Escrow Exporter Plan

## Implementation Staging

Encrypted escrow models and hard stops must exist from the beginning, but active escrow payload creation should wait until Phase 2F-5.

## Phase 2F-3 Foundation

Phase 2F-3 should implement only:

- escrow mode recognition;
- standard-mode escrow hard stop;
- allowlist/exclusion constants;
- fake-secret fixture policy;
- recipient metadata schema validation;
- `ESCROW_NOT_INCLUDED.md` for standard backups;
- validator rules that fail if standard backups include escrow payloads.

## Phase 2F-5 Escrow Prototype

Future escrow prototype should use fake secrets first and include:

- `escrow-secret-catalog`
- `escrow-policy-validator`
- `escrow-encryptor-interface`
- recipient public-key validation
- approval record validation
- encrypted payload writer
- escrow manifest writer
- escrow validator
- escrow restore-plan dry-run

## Real Secret Rule

Real secret escrow requires separate owner approval, approved recipient key material, elevated role, reason, audit record, and a later execution gate. Short-lived JWTs, cookies, sessions, auth headers, one-time tokens, personal credentials, and private customer data remain excluded.

## Output Rule

Escrow payloads must never be written to public/static directories, support packets, git-tracked paths, or standard backup bundles.
