# Customer preservation, synthetic cleanup, and rollback

The restricted pre-scale backup passed 18/18 checksum entries. Closeout readback preserved four tenant identities, five UserAccounts, five TenantMemberships, four TenantContactSettings, and 12 FormEntries. Nine production dual-read comparisons reported no password, email, or membership mismatch.

Customer password fingerprints, login emails, roles, memberships, tenant slugs, TenantAdmin ownership, and contact settings were not changed for proof. The required public preservation checks remain explicit: Vegas contact remains `klavier91@aol.com`, and the Vegas TenantAdmin login remains `klavier91@proton.me`.

No synthetic identity was created, so no temporary credential, membership, invitation, contact recipient, session, or TenantAdmin transfer required cleanup. The slot's successful Stage B requests created only the expected bounded login accounting, audit, and session records; no failed first-touch request reached BCrypt or a write. Pending reconciliation and pending security/synthetic operations were zero at closeout.

The known-good production deployment `f6bdf0d7-ca60-4e7f-818c-f4c74a710a86` remains active. The final candidate artifact and deployment metadata are preserved with the stopped validation slot. No production swap was attempted, so rollback did not require a reverse swap.

No customer external email was sent, no Airstrip public-runtime request was made, no DNS/TLS/CMS mutation was performed, and indexing was unchanged. Raw backup, log, and credential material remains outside the repository.
