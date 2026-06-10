# Security Boundaries

## Allowed

- Read fake fixtures from this package.
- Write generated folder bundles under package `.tmp/`.
- Compute SHA-256 checksums for local generated files.
- Run local validation and local Node tests.
- Write validation JSON/Markdown reports inside generated `.tmp` bundles.
- Write restore-plan dry-run reports inside generated `.tmp` output.
- Write Cosmos seed/migration dry-run documents and plans inside generated `.tmp` output.
- Write fake encrypted escrow prototype output under generated `.tmp` output.

## Blocked

- Protected config reads.
- Environment secret reads.
- Uploaded env/key file reads.
- API key, JWT, auth header, cookie, token, connection string, storage key, or private key export.
- Real secret export.
- Real CMS/API calls.
- Real database export commands.
- Real Cosmos seed/import/write commands.
- Media/blob downloads.
- Real static generation.
- Encrypted escrow payload creation.
- Production escrow payload creation.
- Private key persistence.
- Restore execution.
- Runtime storage switch.
- Real restore target writes.
- Backup zip creation.
- External HTTP checks.
- Azure, Cloudflare, DNS, deployment, Function App setting, email, Microsoft 365, Search Console, indexing, or live-page actions.

## Standard Backup Secret Exclusion

Standard backups always write `escrow/ESCROW_NOT_INCLUDED.md` and must not contain encrypted escrow payloads or secret-bearing files.

The validator rejects:

- escrow payload filenames;
- protected config filenames;
- token/JWT/credential/auth-header/cookie/connection-string/storage-key/private-key filenames;
- obvious secret-like values in generated files;
- config inventory values that are not redacted markers.

## Generated Output

`.tmp/` output is ignored and must not be staged. Generated negative failure bundles, restore-plan reports, Cosmos seed dry-run packages, and fake escrow outputs are test artifacts only.
