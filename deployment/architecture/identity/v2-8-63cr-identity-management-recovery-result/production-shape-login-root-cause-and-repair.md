# Production-shape login root cause and repair

The failed 63C candidates inserted a synchronous Cosmos session-version query between successful legacy credential verification and JWT issuance. That cross-partition/scalar materialization path was incompatible with production document shapes and could return 500 or wait indefinitely.

Commit `c03f0413` replaced it with a bounded deterministic point read, accepts missing, null, numeric, and safely convertible string values, and routes malformed/additive failures to an idempotent reconciliation record without invalidating verified legacy credentials. The healthy path keeps legacy accounting, new identity metadata, and one correlation-keyed audit. Source fixtures cover all session-version shapes.

Commit `92ee1670` corrected management lookups for backfilled accounts that have `legacyUserId` but no `legacyTenantId`: actor tenant context comes from the authenticated claim and legacy credential records are resolved by current login email.

The remaining production-only latency is unresolved. The same `92ee1670` package passed the isolated canary, then timed out both approved production logins. Activation therefore stopped and rolled back.
