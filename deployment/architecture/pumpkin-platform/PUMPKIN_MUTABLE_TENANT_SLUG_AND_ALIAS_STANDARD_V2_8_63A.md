# Pumpkin mutable tenant slug and alias standard V2.8.63A

`tenantUid` is permanent, internal and never editable. Canonical `tenantSlug` is mutable presentation/routing metadata. Legacy `tenantId` remains compatible.

Slug changes execute only through audited background jobs after syntax, reserved-word, uniqueness, alias, tenant-state, concurrent-job and dependency preflight. The old slug becomes an immutable alias to the current canonical slug. Jobs are idempotent, resumable and rollback-aware. Custom domains, memberships, credentials, FormEntry identity and immutable media namespaces do not change. Aliases resolve before authorization and therefore never grant access.
