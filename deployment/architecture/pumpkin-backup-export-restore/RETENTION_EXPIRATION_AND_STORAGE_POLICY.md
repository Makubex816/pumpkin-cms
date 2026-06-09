# Retention Expiration And Storage Policy

## Retention Classes

| Class | Intended lifetime | Notes |
| --- | --- | --- |
| pre-write | short | created before CMS writes; kept through verification window |
| pre-deployment | short to medium | kept through cutover and rollback window |
| routine tenant | medium | scheduled tenant safety checkpoint |
| platform release | medium to long | used for platform release rollback |
| recovery escrow | shortest practical | encrypted, elevated, aggressively reviewed |
| audit log | long | metadata only, no secrets |

## Storage

- Private backup storage, not public/static directories.
- Encryption at rest.
- Access-controlled download.
- Explicit expiry.
- Cleanup worker with audit record.

## Expiration

Expired artifacts should be:

1. marked expired;
2. blocked from download;
3. deleted by cleanup worker;
4. recorded in audit log.

Escrow artifacts should have shorter default retention than standard artifacts and require renewal approval to extend.
