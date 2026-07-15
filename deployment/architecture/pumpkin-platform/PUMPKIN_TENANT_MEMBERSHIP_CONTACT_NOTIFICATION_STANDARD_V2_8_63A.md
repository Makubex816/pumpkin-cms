# Pumpkin tenant membership, contact and notification standard V2.8.63A

Membership uniqueness is `(tenantUid,userId)`. TenantAdmin may manage only memberships in an active authorized tenant and cannot grant SuperAdmin. Suspending/revoking the final active TenantAdmin is forbidden; responsibility changes through an audited transfer between eligible memberships. Duplicate invitations are idempotent and duplicate emails link or conflict-hold one global account rather than create silent duplicates.

Tenant contact settings are tenant-UID scoped. Primary contact, ordered recipients, active/verification states, default policy and FormDefinition overrides are independent from login email. Cross-tenant recipients are never exposed. FormEntry persistence succeeds independently of optional delivery; Admin shows these capabilities separately.
