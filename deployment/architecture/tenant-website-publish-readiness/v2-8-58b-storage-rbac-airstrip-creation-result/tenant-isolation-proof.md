# Tenant Isolation Proof

Airstrip TenantAdmin readback:

- Page count: 5.
- Theme count: 1.
- FormDefinition count: 1.
- MediaAsset count: 13.

Protected Ice access attempts using the Airstrip TenantAdmin token:

- Ice pages status: 403.
- Ice forms status: 403.
- Ice media status: 403.
- Ice tenant status: 403.
- Isolation passed: True.

Ice TenantAdmin cross-tenant proof was not run because separate Ice TenantAdmin test credentials were not available in the approved secure file.
