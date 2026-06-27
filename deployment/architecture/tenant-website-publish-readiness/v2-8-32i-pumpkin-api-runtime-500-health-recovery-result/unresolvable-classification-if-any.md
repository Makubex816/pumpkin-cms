# Unresolvable Classification

Live blocker after V2.8.32I:

`live_health_500_persists_until_locally_validated_null_safe_jwt_fix_is_deployed_under_new_approval`

What is resolved locally:

- Exact HTTP `500` root cause was identified.
- Source was corrected to avoid null JWT secret encoding.
- Local no-secret health returned HTTP `200` for both health routes.

What remains unresolved live:

- The locally validated final fix was not deployed because the single approved deployment attempt had already been used.

Required resolution:

Approve one follow-up deployment of the current source or the local fixed artifact, then run the two approved health GETs.
