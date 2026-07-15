# Account email, password, session and notification design

UserAccount separates immutable `userId` from normalized login email and tenant access. Password hashes remain compatible and are never serialized by the portable backup projection. A password/email/role security change increments `sessionVersion` and rotates `securityStamp`; sensitive writes must compare current server state rather than trust long-lived claims.

Verified email and reset tokens use 48 random bytes, SHA-256 at rest, fixed-time comparison, expiry, one-use state and request/user scope. Normalized-email uniqueness is enforced before atomic activation. Duplicate identities are conflict-held, never silently merged. Administrative override requires reason and session revocation; responsibility transfer uses memberships instead of changing another person's global identity.

The notification interface and transactional outbox support verification, reset, invitation, transfer and security notices with deduplication, attempts, retry/dead-letter state and safe errors. The only registered provider reports `DisabledNoProvider` and never claims delivery. Logged-in password changes and audited future restricted administrative resets do not depend on an external sender.
