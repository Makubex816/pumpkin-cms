# Implemented target model and API map

`IdentityModels.cs` defines TenantIdentifierAlias, TenantRenameJob/Step, UserAccount, TenantMembership, UserInvitation, MembershipTransferRequest, EmailChangeRequest, PasswordResetRequest, TenantContactSettings, FormNotificationRecipient, UserSession, IdentityNotificationOutboxItem, SecurityAuditEvent, IdentityMigrationConflict, IdentityBackfillRun, and IdentityFeatureState. Tenant now has optional `tenantUid`, `tenantSlug`, and feature state while every legacy field remains.

`IdentityEndpoints.cs` registers feature-gated current-user routes for profile, memberships, switching, verified email change, password change and session revocation; tenant routes for settings, contacts, notifications, rename lifecycle, memberships/invitations/transfers and audit; and SuperAdmin routes for global search, membership views, email/password/session controls, rename, contact settings, audit and conflicts.

Disabled behavior is explicit `404 identity_feature_disabled`; enabled-but-unwired behavior is `501`, preventing false success. Authentication is required for every route. Mutation implementation in V2.8.63B must bind authoritative session and membership checks, audit, idempotency, conflict semantics and provider storage before enabling the flag.

Provider definitions declare unique normalized email, tenant-user membership, alias slug, job/request IDs and outbox deduplication. Cosmos and Mongo must pass the same definition set.
