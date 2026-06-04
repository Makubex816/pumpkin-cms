# Ice Contact Draft Preview Support

Generated: 2026-06-04

Scope:

- Added local draft preview route support for IceSkatingRinkRentals.com `/contact`.
- Reused the shared Ice draft preview client and auth/token-entry flow.
- Added the `/__preview/ice-rink-rentals/contact` rewrite alias.
- No CMS records, Theme records, MediaAsset records, static packages, deployment, DNS/email/provider settings, protected config, or Roller state were changed.

Primary preview URLs:

- `http://localhost:3002/draft-preview/ice-rink-rentals/contact`
- `http://localhost:3002/__preview/ice-rink-rentals/contact`

Public route remains:

- `http://localhost:3002/contact`
