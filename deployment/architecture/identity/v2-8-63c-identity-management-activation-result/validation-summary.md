# Validation summary

- Required commits/branch/staging: passed
- Expanded backup and local API builds: passed
- API attempt 1: deployment succeeded; login 500
- API attempt 2: deployment succeeded after schema-neutral correction; login 500
- API attempt 3: deployment succeeded after scalar-query correction; login timed out
- Known-good rollback: deployed; legacy login restored after dual-write disable
- Management flags: disabled
- Admin/starter deployments: zero
- Synthetic/customer mutations: zero
- Airstrip/indexing: untouched
- Final status mandated by retry policy: blocked
