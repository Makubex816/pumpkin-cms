# Logical Submission, FormEntry, and Isolation Proof

One transport attempt returned HTTP 201 in 3.741s.

- submission/FormEntry: `0caaac4b-662f-46d6-89d8-272fe2cc154f`
- correlation: `dabf4dd0-6570-47c0-ac47-d0c01483bf2c`
- idempotency-key SHA-256: `33733D718B9FB6EE7F064948641B7A1F3542174CCA3FFF389BDCEC920809B8C5`

Authenticated lookup returned exactly one result by submission ID and exactly one by correlation ID. Consent was true, honeypot false, and source was the Vegas custom host. Vegas TenantAdmin read the entry. The same ID returned 404 in Ice and Party Pros for SuperAdmin; Vegas TenantAdmin received 403 for both control tenants. No external email sender exists.
