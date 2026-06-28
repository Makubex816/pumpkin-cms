# V2.8.32W Live Admin Login 500 Repair Contact Readback Result

Phase status: blocked after live Admin login repair, before production contact POST.

Classification: `admin_formentry_readback_container_not_found_after_login_repair`.

V2.8.32W used the completed V2.8.32V result and the approved ignored secure file `.tmp/v2-8-32w/secure/live-admin-login-500-repair.json`.

Completed:

- Confirmed the secure file exists, is git-ignored, and contains the approved required fields.
- Reconfirmed source login/JWT requirements.
- Reproduced the live Admin login HTTP 500 with no bearer token.
- Set only the source-discovered non-secret JWT support settings required by login token generation.
- Restarted the existing Pumpkin API Web App once.
- Confirmed both Pumpkin API health routes returned HTTP 200.
- Confirmed live Admin login now returns HTTP 200 and issues a bearer token.
- Used the bearer token only in memory for authenticated Admin FormEntry readback preflight.
- Confirmed static contact health and page preflights against approved URLs.

Blocked:

- Authenticated Admin FormEntry readback returned HTTP 500.
- The sanitized problem response shows Cosmos NotFound for the source-required `FormEntry` container.
- V2.8.32W did not approve FormEntry container creation, so the phase stopped before production POST.

Production contact POST count: 0.

Contact gate status: open.
