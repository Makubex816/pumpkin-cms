# Blockers Or Warnings

## Blockers

- No Cosmos DB accounts were visible in the active Azure subscription.
- Cosmos/provider env hints were missing.
- Tenant/site scope env hints were missing.
- Cosmos database/container discovery could not safely proceed without an account.
- Cosmos platform backup evidence could not be collected.
- Portable Cosmos JSON export remains unapproved and blocked.
- Media blob copy/download remains unapproved.

## Warnings

- CMS API env vars were present, but CMS API checks were not required for this Azure connector preflight and no CMS writes were allowed.
- A transient fake escrow regression failure occurred in one `npm run check` attempt; the clean rerun passed all 48 tests.
- Media metadata discovery succeeded, but metadata listing is not the same as restore-proof blob copy.

## Non-Issues

- The known Ice media storage account and container were confirmed.
- Blob metadata listing worked with RBAC/login only.
- Fake Cosmos/media connector foundation remains healthy.
