# Azure Creation Approval Checklist

This checklist must pass before any future Azure creation or mutation phase.

## Required Approval Inputs

- Explicit approval to create or update Azure resources.
- Approved subscription and tenant context, recorded without exposing IDs if redaction is required.
- Approved non-production resource group name.
- Approved region.
- Approved resource naming suffixes.
- Approved Cosmos account/database/container plan.
- Approved storage evidence plan.
- Approved Key Vault secret-reference plan.
- Approved identity/session model.
- Approved RBAC role assignment plan.
- Approved cost guardrail and cleanup owner.

## Required Safety Checks

- Confirm target is staging, not production.
- Confirm no protected config read is required.
- Confirm no keys, `listKeys`, connection strings, SAS, Key Vault secret values, tokens, cookies, or auth headers are needed.
- Confirm deployment dry-run or template validation can run without secrets.
- Confirm Resource Registry candidate is ready.
- Confirm Backup Center pre-write evidence requirements are known.
- Confirm Runtime QA evidence requirements are known.
- Confirm rollback and abort criteria are documented.

## Hard Stops

- Any production scope.
- Any missing `OLM_STAGING_*` required first-write value.
- Any request for keys, connection strings, SAS, or protected config.
- Any unapproved RBAC assignment.
- Any uncontrolled POST, PUT, PATCH, DELETE, deploy, publish, or indexing action.

