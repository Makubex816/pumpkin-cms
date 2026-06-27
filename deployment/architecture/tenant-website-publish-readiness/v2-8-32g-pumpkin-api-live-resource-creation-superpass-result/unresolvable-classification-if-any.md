# Unresolvable Classification

Date: 2026-06-27

## Classification

`deployment_server_side_400_diagnostics_required`

## Reason

The selected Central US Web App exists and is running, but the single approved ZIP deployment attempt failed server-side with HTTP `400`.

Because the deployment reached Azure, a blind retry was not allowed.

## Exact Next Action

Approve a bounded deployment diagnostics phase for `app-pumpkin-api-prod-centralus-001`.

The diagnostics phase should allow public-safe deployment status review and local ZIP/package inspection or rebuild if needed, while still prohibiting app settings, protected config, secrets, keys, connection strings, SAS, contact POST, DNS, indexing, and arbitrary outbound checks.
