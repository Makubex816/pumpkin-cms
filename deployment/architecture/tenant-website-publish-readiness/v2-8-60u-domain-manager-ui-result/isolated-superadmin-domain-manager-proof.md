# Isolated SuperAdmin Domain Manager Proof

Status: passed.

Host:

- `https://app-pumpkin-admin-isolated-centralus-001.azurewebsites.net`

Proof:

- SuperAdmin login succeeded.
- `Domains` nav was visible.
- `/dashboard/onboarding/domains` loaded.
- Ice and Airstrip tenants were visible.
- Airstrip DomainBinding was visible.
- Status `pending_dns_records` was visible.
- DNS validation status `pending` was visible.
- DNS packet matched V2.8.60T.
- Read-only DNS validation ran and displayed a last validation result.
- Future binding/TLS/promote/rollback controls were disabled.
