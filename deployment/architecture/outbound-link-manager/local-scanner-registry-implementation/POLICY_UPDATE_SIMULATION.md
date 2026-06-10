# Policy Update Simulation

Policy update simulation uses `update_policy` action fixtures with `payload.policy` or `payload.policyPatch`.

The simulator normalizes the policy, replaces or activates it in the sandbox store, applies policy classification to sandbox links and instances, and writes change counts. It can demonstrate blocked-domain and pending-review outcomes without saving any policy to Pumpkin CMS or a database.

Policy simulation output includes:

- `ACTION_RESULT.json`
- `PUBLISHING_IMPACT.json`
- `ACTION_AUDIT_LOG.json`
- `ROLLBACK_PLAN.json`
- `sandbox-store/outbound-link-policies.json`

Future production policy editing must add conflict checks, durable audit persistence, provider transactions, and operator approval gates.
