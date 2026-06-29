# Tenant Key Rotation Result

Tenant: `ice-rink-rentals`.

Source-discovered container: `Tenant`.

Mutation performed:

- `apiKey`
- `apiKeyHash`
- `apiKeyMeta`
- `updatedAt`

Result:

- Tenant record found: yes.
- Tenant ID matched: yes.
- New hash present after mutation: yes.
- `apiKeyMeta.isActive` true after mutation: yes.
- Prior key captured for rollback in ignored working context: yes.
- Rollback performed: no.
- Secret values printed: no.

No unrelated tenant records were mutated.
