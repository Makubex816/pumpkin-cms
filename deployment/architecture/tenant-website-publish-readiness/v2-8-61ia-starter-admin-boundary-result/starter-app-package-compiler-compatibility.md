# Starter App Package Compiler Compatibility

Status: source-compatible with documented gaps.

Tenant package V1 provides:

- tenant profile;
- brand/theme;
- pages;
- forms;
- media manifest;
- domains;
- validation and responsive routes;
- publish metadata.

Starter app alignment:

- pages map to starter public rendering through Pumpkin API page contracts;
- theme data maps to starter runtime theme usage;
- forms map to FormDefinition and FormBlock rendering;
- media URLs can be rendered when package output resolves to public URLs;
- domains/DomainBinding remain read-only metadata outside starter `/admin`.

Gaps deferred to V2.8.61J or later:

- no starter package-import adapter was added in V2.8.61IA;
- no live Package Compiler output was consumed;
- no deployment or sandbox runtime proof occurred.
