# Multi-Tenant Identity Future Architecture

Future Pumpkin identity separates `UserAccount`, `TenantMembership`, and tenant contact/notification settings. One global user may hold multiple isolated memberships, with role and tenant scope stored on membership rather than one global `user.tenantId` field.

No automatic account merge, password replacement, membership overwrite, or cross-tenant authorization shortcut is allowed. The existing Airstrip identity remains unchanged. V2.8.62DR made no identity, JWT, session, role, or authorization schema change.
