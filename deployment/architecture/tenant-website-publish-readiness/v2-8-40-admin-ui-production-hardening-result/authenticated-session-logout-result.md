# Authenticated Session Logout Result

Authenticated session proof passed on isolated and production.

Isolated:

- UI login status: HTTP 200.
- Pages route loaded: true.
- Logout cleared token/user/current-tenant browser storage: true.
- Protected route after logout returned to `/login`.

Production:

- UI login status: HTTP 200.
- Pages route loaded: true.
- Logout cleared token/user/current-tenant browser storage: true.
- Protected route after logout returned to `/login`.

No bearer token, cookie, or password value was printed or written.

