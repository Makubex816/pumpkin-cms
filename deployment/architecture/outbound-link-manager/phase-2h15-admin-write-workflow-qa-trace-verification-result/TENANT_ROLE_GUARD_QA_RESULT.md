# Tenant And Role Guard QA Result

Guard failures verified:

- viewer role blocked with `ROLE_BLOCKED`
- wrong tenant blocked with `TENANT_SCOPE_MISMATCH`
- bulk action without approval reference blocked with `APPROVAL_REFERENCE_REQUIRED`

Guard fields verified in trace/API responses:

- tenant key
- site key
- actor ID
- actor email
- actor role
- assigned tenant guard result through block reason
- approval state
- approval reference

No production identity provider, CMS API, or protected config source was used.
