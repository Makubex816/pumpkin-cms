# Log Analytics Static Contact Query Result

Query path:

- Used Log Analytics API with an Azure access token kept in memory.
- Queried an 8-hour window for SWA/static-contact health related rows.
- Redacted token-like, key-like, password-like, and authorization-like content before output.

Result:

- Matching row count: 0.
- Classification: `logs_unavailable_due_ingestion_delay`.
- Query error: none.
- Secret values printed: no.

The lack of matching rows did not block source/config/GET diagnosis.

