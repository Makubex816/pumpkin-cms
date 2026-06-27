# Prioritized Implementation Sequence

1. Resolve live Pumpkin API host status.
2. If no host exists, prepare a narrowly scoped API exposure/deployment plan.
3. Bind API runtime to the intended production Cosmos provider through a protected setting workflow.
4. Verify non-secret provider metadata from the live API.
5. Bind Admin to the verified API base URL.
6. Run Admin read-only form-entry checks with approved auth.
7. Bind isolated static contact managed API to Pumpkin API mode.
8. Run isolated static contact health, OPTIONS, and CORS checks.
9. Run exactly one approved isolated contact write.
10. Confirm the returned id appears in Admin and backup/export evidence.
11. Prepare production binding rollback package.
12. Request separate production contact persistence binding approval.

## Why this order

The sequence keeps public production contact untouched until the API runtime, provider target, Admin read path, and rollback lane are already proven. It also avoids treating a successful static contact response as proof of persistence.
