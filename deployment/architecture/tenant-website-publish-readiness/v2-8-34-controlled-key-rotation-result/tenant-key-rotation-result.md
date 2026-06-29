# Tenant Key Rotation Result

Tenant: `ice-rink-rentals`.

Source-discovered container: `Tenant`.

Mutation performed:

- `apiKey`
- `apiKeyHash`
- `apiKeyMeta`
- `updatedAt`

Mutation scope:

- Only the `ice-rink-rentals` tenant auth record was mutated.
- No `roller-rink-rentals` or unrelated tenant record was mutated.

Result:

- Tenant record found: yes.
- Tenant ID matched: yes.
- New hash present after mutation: yes.
- `apiKeyMeta.isActive` true after mutation: yes.
- Secret values printed: no.

Rollback:

Rollback was performed after isolated verification returned HTTP 400. The prior tenant document was restored.
