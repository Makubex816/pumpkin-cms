# Isolated TenantAdmin Denial Proof

Status: passed.

Host:

- `https://app-pumpkin-admin-isolated-centralus-001.azurewebsites.net`

Proof:

- Airstrip TenantAdmin login succeeded.
- `Domains` nav entry was hidden.
- Direct route `/dashboard/onboarding/domains` showed `Access Restricted`.
- Direct DomainBinding API call returned HTTP 403.

Production deployment proceeded only after this isolated denial proof passed.
