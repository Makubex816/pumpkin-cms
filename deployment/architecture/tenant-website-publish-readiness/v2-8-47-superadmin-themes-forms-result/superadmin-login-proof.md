# SuperAdmin Login Proof

Result: passed.

Live checks:

- Admin login endpoint: HTTP success.
- Auth verify endpoint: HTTP success.
- Login role: `SuperAdmin`.
- Verify role: `SuperAdmin`.
- Tenant claim: `ice-rink-rentals`.
- Username: `spectre-dev`.
- Permissions count: 13.
- Email claim matched the approved secure SuperAdmin email.

Secret handling:

- Password was not printed.
- Runtime auth token was not printed or written to repo files.
