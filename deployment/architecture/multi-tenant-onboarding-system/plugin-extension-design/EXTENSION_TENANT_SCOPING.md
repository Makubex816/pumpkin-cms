# Extension Tenant Scoping

Extensions must declare tenant scope:

- single tenant
- tenant group
- all tenants, only after platform approval

Tenant scope validators must prevent an extension enabled for one tenant from adding routes, fields, media, forms, or API behavior to another tenant.

Paused tenants must remain untouched.

