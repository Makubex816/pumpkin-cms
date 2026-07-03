# Pumpkin Airstrip Tenant Isolation V2.8.58B

Tenant isolation proof passed.

Airstrip TenantAdmin can read Airstrip-owned pages, theme, FormDefinition, and MediaAsset records.

Airstrip TenantAdmin was denied access to Ice protected routes:

- Ice pages: HTTP 403.
- Ice forms: HTTP 403.
- Ice media: HTTP 403.
- Ice tenant: HTTP 403.

Ice counts were unchanged before and after Airstrip creation.
