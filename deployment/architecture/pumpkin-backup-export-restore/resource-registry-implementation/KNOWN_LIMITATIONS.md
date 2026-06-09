# Known Limitations

- The registry fixture is a local redacted seed, not a live inventory crawl.
- The package is folder-based; no zip archive writer is included.
- Vault decryption validation requires the passphrase in the current process environment or an explicit test passphrase.
- The session vault allowlist currently includes only `ROLLER_RINK_RENTALS_API_KEY`.
- `PUMPKIN_ADMIN_JWT` is always excluded from durable escrow by default.
- No Backup Center Admin UI, Pumpkin API, Electron app, live page publication, deployment, or Search Console workflow is implemented here.
