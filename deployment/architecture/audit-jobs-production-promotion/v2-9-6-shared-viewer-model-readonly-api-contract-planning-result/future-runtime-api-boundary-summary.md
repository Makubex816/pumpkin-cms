# Future Runtime API Boundary Summary

Status: contract only.

V2.9.6 did not implement Pumpkin API runtime endpoints.

Planned future endpoint shape:

- GET-only;
- Admin authorization required;
- tenant/site context required;
- returns `audit-job-ledger-readonly-api-envelope.v1`;
- provider mode `future-pumpkin-api-readonly`;
- no write methods;
- no provider writes;
- no CMS writes;
- no protected config reads.

Implementation requires a separate future approval.
