# V2.8.32U Carryforward

V2.8.32U established:

- Login source uses Cosmos container `User`.
- Lookup field is `email`.
- Partition key value is `tenantId`.
- Active field is `isActive`.
- Password field is `passwordHash`.
- Hash/verify algorithm is BCrypt.
- Role is numeric `UserRole`; TenantAdmin is `1`.
- Approved identity read returned Cosmos 404 because `User` container was missing.
- No Admin identity mutation occurred.
- No production POST occurred.

V2.8.32V accepted the blocker `admin_identity_container_not_found` and created/confirmed the `User` container plus Admin identity.

