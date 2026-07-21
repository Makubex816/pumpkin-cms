# IDM-40 mutable tenant slug activation prompt

Precondition: IDM-40 is retained as downstream continuation after the UP-20/UP-30/INT-10 path, unless the owner explicitly selects IDM-40 first.

```text
TASK ID: IDM-40 — Mutable Tenant Slug Activation

Carryforward:
- IDM-30 / CRSTUR completed identity-management production activation.
- Tenant rename, migration execution, external provider, Airstrip public runtime, indexing, and payment remain held.
- PERF-10 owns S2/two-worker observation; IDM-40 does not authorize capacity change.

Objective:
Plan and, only when separately authorized, execute controlled mutable tenant slug activation without customer credential, role, membership, contact, form, FormEntry, domain, DNS, indexing, or Airstrip regression.
```
