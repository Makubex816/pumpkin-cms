# Preview Security Notes

Security behavior:

- The preview page requires manual browser token entry through the existing shared preview client.
- Tokens are held in browser `sessionStorage` under `pumpkin_ice_contact_preview_jwt`.
- Tokens were not read from protected config and were not printed.
- The route has noindex/nofollow/nocache metadata.
- The route is disabled in static render mode.
- The route does not perform CMS writes.

Out of scope and not performed:

- CMS record updates.
- Theme or MediaAsset updates.
- Static generation.
- Deployment.
- DNS/email/provider changes.
- Email sending.
- Protected config reads.
- Roller work.
