# Escrow Policy

The Phase 2F-6 fake escrow policy requires:

- fake-only request, policy, catalog, and recipient metadata;
- `recovery_escrow` mode;
- a reason;
- an approval record;
- recipient metadata;
- runtime-generated public key metadata;
- allowlisted categories only;
- no blocked short-lived/session categories;
- no high-risk value patterns in fake fixture values;
- standard backups to remain escrow-free.

Blocked categories include short-lived token, session-cookie, and JWT style categories.

## Real Escrow Gate

Real escrow must not reuse this fake policy as a production decision. A future phase must define owner approval, recipient identity, key custody, rotation, revocation, access logs, and restore authorization.
