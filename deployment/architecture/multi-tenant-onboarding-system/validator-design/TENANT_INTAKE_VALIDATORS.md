# Tenant Intake Validators

Validate:

- tenant display name present
- primary domain present
- `www` and media domain decisions recorded
- tenant ID and site key placeholders present
- business type present
- approved and forbidden routes present
- paused/related tenants recorded
- form recipient and mailbox owner recorded
- DNS, cutover, indexing, legal/privacy, analytics, and rollback owners recorded
- no secret-looking values in intake forms

Output should tell the user exactly which blank field needs attention.

