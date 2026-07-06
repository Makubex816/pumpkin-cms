# V2.8.60WC-DOC Carryforward

V2.8.60WC-DOC documented direct operator password rotation from redacted proof but blocked on a TXT checksum mismatch.

Carryforward:

- Redacted proof reported direct operator rotation completed.
- Old credential rejected: true.
- New credential login succeeded: true.
- Role after rotation: `SuperAdmin`.
- Tenants/users/domain-bindings access: HTTP 200.
- Airstrip TenantAdmin login unchanged: HTTP 200.
- Old V2.8.47 hardcopy preserved: true.
- JSON hardcopy hash matched expected.
- TXT hardcopy computed hash was `8e99e59b6680d07cfa1c88db9126f4732da209d5ebccf4c8d0cf0d854d54b609`.
- Prior hardcoded TXT expected value is not source-of-truth.

