# Ice Admin Auth Diagnostic

Diagnostic-only package for the admin JWT issue that blocked the Ice homepage/contact local draft import.

- CMS writes performed: no
- Homepage/contact import performed: no
- `/service-areas`, Theme, MediaAsset updates: no
- Static regeneration/deploy/DNS/email/provider/Azure/Cloudflare/Bluehost: no
- Protected config read: no
- RollerRinkRentals.com: paused

Current diagnostic state: local API and admin frontend are reachable, but no admin token file or env token was present when the safe helpers were run.

