# Customer preservation, cleanup, and rollback proof

- Customer password hashes, emails, roles, memberships, tenant slugs, and contact/notification values were not intentionally mutated.
- Existing approved credentials were used only for bounded login probes; tokens were discarded.
- No synthetic records, invitations, password handoffs, or temporary memberships require cleanup.
- No Airstrip public request, DNS/TLS/CMS/form mutation, or indexing action occurred.
- Candidate rollback used the verified package `pumpkin-api-v2-8-63b-r3.zip`, SHA-256 `8f5db9c94ceac79d63ffe1aa71c578cc794bcb8b49e62462712ef37c435f59f8`.
- Final rollback deployment: `f6bdf0d7-ca60-4e7f-818c-f4c74a710a86`.
- The temporary canary app and plan were deleted.
