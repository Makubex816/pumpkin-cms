# Direct Operator Proof Summary

Source reviewed: redacted proof JSON only.

`.tmp\v2-8-60wc\operator-proof\rotation-proof-redacted.json`

Proof scan:

- JSON parse: passed.
- Raw password/hash pattern hits: 0.

Redacted proof values:

| Proof | Value |
| --- | --- |
| Rotation status | `completed_direct_operator_password_rotation` |
| Old credential rejected | true |
| New credential login succeeded | true |
| Role after rotation | `SuperAdmin` |
| SuperAdmin tenants access HTTP | 200 |
| SuperAdmin users access HTTP | 200 |
| SuperAdmin domain bindings access HTTP | 200 |
| TenantAdmin proof status | `airstrip_tenantadmin_login_unchanged` |
| TenantAdmin login HTTP | 200 |
| Old hardcopy preserved | true |
| No domain/DNS action | true |
| No contact POST | true |
| No form submission | true |
| No customer-facing POST proof | true |
| No deploy | true |

Codex did not perform the rotation and did not use any password.

