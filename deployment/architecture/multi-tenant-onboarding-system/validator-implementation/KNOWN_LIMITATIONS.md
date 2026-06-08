# Known Limitations

- JSON Schema validation is intentionally minimal and local. It validates `type`, `required`, `additionalProperties`, `enum`, `const`, `pattern`, string length, array item count, `uniqueItems`, nested `properties`, and `items`.
- JSON Schema `format` is not enforced in Phase 2A-1.
- `$ref`, `oneOf`, `anyOf`, `allOf`, `if/then/else`, and custom vocabularies are not implemented.
- Deep media reference validation is deferred.
- Deep form reference validation is deferred.
- SEO canonical/sitemap alignment beyond basic schema validation is deferred.
- Deployment profile environment-variable classification is deferred.
- Extension permission and migration schema validation is deferred.
- The CLI is local to this package and is not registered as a global Pumpkin command.
- The validator writes only local reports and performs no external checks.
