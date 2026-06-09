# Known Limitations

Remaining limitations:

- JSON Schema support is still intentionally minimal and dependency-free.
- JSON Schema `format`, `$ref`, `oneOf`, `anyOf`, `allOf`, and custom vocabularies are not implemented.
- Media/form reference detection is based on documented field-name conventions until block schemas exist.
- Sitemap validation supports optional future fields but current core schemas do not define sitemap URL arrays.
- Deployment profile environment-variable classification is deferred.
- Profile-specific smoke-test fixtures are deferred.
- Extension permission and migration schema validation is deferred.
- CLI polish, report snapshots, and code explanation commands are deferred.

The validator remains suitable for offline pre-import validation, not for tenant creation or external launch automation.
