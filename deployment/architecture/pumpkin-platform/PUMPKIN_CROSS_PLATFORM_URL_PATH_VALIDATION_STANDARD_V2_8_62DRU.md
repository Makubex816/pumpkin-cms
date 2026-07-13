# Pumpkin Cross-Platform URL Path Validation Standard V2.8.62DRU

Tenant application routes use URL semantics, not host filesystem semantics.

- Accept valid leading-slash internal routes and valid query components.
- Reject Windows drive paths, all backslash/UNC paths, file URIs, traversal, control characters, and unsupported schemes.
- Normalize consistently on Windows and Linux.
- Retain self-loop, cycle, duplicate-source, unresolved-target, and page-shadow policy checks.
- Prove behavior locally and on the deployed Linux runtime before tenant writes.
