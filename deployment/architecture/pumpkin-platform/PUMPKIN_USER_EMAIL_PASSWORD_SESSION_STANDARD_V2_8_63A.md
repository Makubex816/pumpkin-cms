# Pumpkin user email, password and session standard V2.8.63A

Login email is normalized and globally unique; it is independent from tenant contacts. Verified self-change requires reauthentication, a high-entropy hashed expiring one-use token, atomic uniqueness enforcement and session invalidation. Administrative override requires SuperAdmin, reason, audit and sign-out; it never silently merges identities.

Passwords are never retrievable. Existing hashes remain valid. Self-change verifies the current password, applies policy/rate limits, rotates security stamp/session version and audits. Reset responses do not enumerate accounts. Temporary passwords are one-time restricted handoffs, never repository output, and require next-login rotation. Notification workflows use an outbox; no-provider state never claims delivery.
