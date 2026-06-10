# Live-Readonly Verification Plan

Live-readonly is a future explicit profile for readback and inventory only.

Allowed in a future approved phase:

- count records by tenant/site
- read provider metadata from safe Resource Registry entries
- read non-secret production records
- compare production records with dry-run expectations
- produce readback reports

Not allowed in live-readonly:

- writes
- upserts
- deletes
- migrations
- schema changes
- external crawling
- key/listKeys calls
- connection strings
- SAS generation

Verification must prove read-only behavior by attempting no mutation path and confirming API/Admin still block write actions.
