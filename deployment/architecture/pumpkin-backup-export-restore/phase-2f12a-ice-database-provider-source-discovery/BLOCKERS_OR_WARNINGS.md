# Blockers Or Warnings

## Blockers

- Live database account/source identity is unresolved.
- No Cosmos/provider env hints are present.
- Accessible Azure scope exposes no Cosmos, SQL, MongoDB, or other provider database resources.
- CMS/API has no safe provider metadata endpoint.
- Authenticated CMS/API verify check returned `401` with the session JWT, body suppressed.

## Warnings

- Admin tenant reads can include API-key fields and should not be used for provider discovery unless a sanitized endpoint or projection is implemented.
- Cosmos is the expected provider direction from docs, but using that assumption for live export would be unsafe without live account/database/container evidence.
- Media storage is discoverable, but Ice is not fully production-restore-proof until database source and media copy/download evidence are both approved and completed.

## Boundary Confirmation

No external system was changed and no live pages were affected.
