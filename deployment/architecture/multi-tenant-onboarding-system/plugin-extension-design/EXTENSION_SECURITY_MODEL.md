# Extension Security Model

Rules:

- no arbitrary code drop-ins
- no secrets in manifests
- no tenant-global permissions by default
- no cross-tenant data access
- no external network calls unless declared and approved
- no CMS writes outside declared fields
- no API endpoints outside declared routes
- no production enablement without tests and rollback

Security review must be complete before production enablement.

