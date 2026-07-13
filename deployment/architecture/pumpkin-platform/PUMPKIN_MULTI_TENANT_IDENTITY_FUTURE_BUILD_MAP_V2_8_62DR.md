# Identity Membership Build Map

V2.8.63A and later phases should:

1. Inventory current user, token, session, and authorization contracts.
2. Add a globally unique normalized `UserAccount` and tenant-scoped `TenantMembership` model behind compatibility reads.
3. Implement verified global login-email change with audit and session revocation/refresh.
4. Implement add-then-prove-then-revoke TenantAdmin membership transfer with rollback metadata.
5. Separate tenant contact and notification email from login identity.
6. Migrate tenant by tenant with Ice, Party Pros, Airstrip, Vegas, and SuperAdmin isolation tests.
7. Remove the legacy single-tenant shortcut only after all compatibility gates pass.

This is a future build map only; no migration was implemented here.
