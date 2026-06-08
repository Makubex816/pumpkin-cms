# Known Limitations

- JSON Schema validation is intentionally minimal and local. It validates `type`, `required`, `additionalProperties`, `enum`, `const`, `pattern`, string length, array item count, `uniqueItems`, nested `properties`, and `items`.
- JSON Schema `format` is not enforced in Phase 2A-3.
- `$ref`, `oneOf`, `anyOf`, `allOf`, `if/then/else`, and custom vocabularies are not implemented.
- Media and form reference validation use documented field-name conventions such as `mediaId`, `formId`, `staticEndpointRef`, and `leadRecipientRef`; they do not understand every future custom block shape yet.
- SEO sitemap validation is implemented only for optional future `sitemapUrls` or `sitemap.urls` fields if present. Current core schemas do not define those fields.
- Support packets summarize file names and findings only. They do not copy source import files by default.
- Error explanations cover the approved starter code list plus several related local validator codes. Future codes must be added to `src/error-explanations.mjs`.
- Deployment profile environment-variable classification is deferred.
- Extension permission and migration schema validation is deferred.
- The CLI is local to this package and is not registered as a global Pumpkin command.
- The validator writes only local reports and performs no external checks.
