# Staging Target Readonly Validation

Status: passed.

Read-only Azure checks confirmed:

- Azure account state: enabled.
- Resource group `rg-pumpkincms-stg-eastus-olm`: `Succeeded`.
- Cosmos account `cosmos-pumpkincms-stg-olm01`: `Succeeded`.
- Database `pumpkincms-olm-staging`: present.
- OLM containers: `10`.
- Container partition key: `/tenantKey` for all 10 containers.
- Cosmos native data-plane role assignments visible at the target scope: `2`.

The Azure CLI output used for docs was sanitized. No subscription ID, operator principal ID, tokens, keys, connection strings, or SAS values were written to the result package.

