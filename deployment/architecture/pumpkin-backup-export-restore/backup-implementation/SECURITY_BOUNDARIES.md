# Security Boundaries

## Allowed

- Read fake fixtures from this package.
- Write generated folder bundles under package `.tmp/`.
- Compute SHA-256 checksums.
- Run local validation.

## Blocked

- Protected config reads.
- Environment secret reads.
- Real CMS/API calls.
- Database export commands.
- Media/blob downloads.
- Static generation.
- Encrypted escrow payload creation.
- Restore execution.
- Backup zip creation.
- External HTTP checks.
- Azure, Cloudflare, DNS, deployment, email, Search Console, or live-page actions.

## Standard Backup Rule

Standard backups always write `escrow/ESCROW_NOT_INCLUDED.md` and must not contain encrypted escrow payloads.
