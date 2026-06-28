# Risk And Open Decisions

Open blocker:

`live_admin_login_failed_http_500`

Risk:

The Admin JWT signing key is now bound, and health is passing, but the login route still fails before a bearer token can be issued. The contact endpoint may be ready for persistence, but V2.8.32Q cannot safely prove it because the Admin readback gate cannot be authenticated before POST.

Open decisions:

- Decide whether the next phase may bind source-referenced non-secret/secret JWT support settings such as `Jwt__Issuer`, `Jwt__Audience`, or `Jwt__ExpirationMinutes` if they are absent, without appsettings list/show.
- Alternatively provide a known-good saved JWT for Admin FormEntry readback.
- Keep the production POST hard stop unchanged: do not send a production contact POST until authenticated Admin FormEntry readback preflight returns 2xx.

