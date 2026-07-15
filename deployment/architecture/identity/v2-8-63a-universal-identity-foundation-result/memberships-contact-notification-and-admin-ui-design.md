# Memberships, contact settings and Admin UI

One global UserAccount can own active memberships in many tenants. Each membership has immutable ID, tenant UID, user ID, tenant role, permissions, lifecycle/audit fields and primary-admin responsibility. TenantAdmin cannot grant SuperAdmin. Final active TenantAdmin removal is rejected until controlled transfer completes.

TenantContactSettings owns primary contact email, independent verification, ordered active recipients, verification state, default policy, FormDefinition overrides, delivery capability, updater and audit reference. Login-email and contact changes never cascade to one another. FormEntry persistence remains explicitly independent of delivery.

Admin adds `/dashboard/identity` with accessible loading/empty/disabled/error notices, keyboard-native controls, password autocomplete, account/security, membership tenant switch, rename preflight, contacts/recipients, users/access, audit, and SuperAdmin platform-control projections. `NEXT_PUBLIC_IDENTITY_FOUNDATION_ENABLED` is false unless explicitly set; controls are disabled and explain the V2.8.63B boundary.
