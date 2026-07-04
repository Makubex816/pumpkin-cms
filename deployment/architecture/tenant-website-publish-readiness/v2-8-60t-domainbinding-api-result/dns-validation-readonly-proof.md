# DNS Validation Read-Only Proof

Status: passed.

Endpoint:

- POST `/api/admin/tenants/airstrip-club-las-vegas/domain-bindings/domainbinding-airstrip-club-las-vegas-airstripclublasvegas-com/validate-dns`

Result:

- HTTP 200
- Validation status: `pending`
- All records verified: false
- Binding status after validation: `pending_dns_records`

Record observations:

| Type | Host | Status | Observed count |
| --- | --- | --- | --- |
| A | `@` | pending | 1 |
| TXT | `asuid` | pending | 0 |
| CNAME | `www` | pending | 0 |
| TXT | `asuid.www` | pending | 0 |

Interpretation:

- Current DNS is not ready for Azure App Service hostname binding.
- This accurately keeps Airstrip in pending DNS state until Bluehost records are applied.

No DNS correction or Azure hostname binding was attempted.

