# Admin Write Preflight Alignment

The Admin Outbound Link Manager keeps production write buttons disabled while adding local/fake preflight wiring in the dashboard action center and link detail drawer.

The Admin mock provider can now create a local write-action response with:

- scoped provider mode
- request/action/correlation IDs
- entity IDs
- audit IDs
- rollback ID
- before/after state hashes
- affected page and instance IDs
- local-only and simulated-only flags

The UI does not call production POST, PUT, PATCH, or DELETE routes. It presents the local/fake trace response so the future production workflow can be reviewed without live mutation.
