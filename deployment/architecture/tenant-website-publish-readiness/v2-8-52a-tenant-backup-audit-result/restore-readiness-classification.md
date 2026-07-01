# Restore Readiness Classification

Classification: `partial_restore_ready_with_identity_secret_and_live_restore_gaps`

Ready:

- Protected bundle has required files.
- Protected checksums validate.
- Tenant data exports are present.
- Media binaries are present and verified.
- Local restore dry-run passed.

Not ready for unattended live restore:

- Full user identity/credential restore is not covered.
- Secret-like tenant/contact/API runtime values are excluded from repo evidence and require secure handoff.
- Live restore adapter and mutation policy were not approved.
- FormEntry PII restore requires explicit target approval.

Conclusion: the Ice tenant has a usable protected backup proof for audit and restore planning, but live restore remains a separate controlled phase.
