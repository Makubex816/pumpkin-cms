# Tenant API Key Alignment Result

Reason:

The direct valid Pumpkin API write probe returned HTTP 401. Source confirmed tenant key validation requires the Cosmos `Tenant` container, the `ice-rink-rentals` tenant document, and an active BCrypt `apiKeyHash`.

Mutation:

- Created or confirmed source-required container: `Tenant`.
- Partition key: `/tenantId`.
- Created source-compatible `ice-rink-rentals` tenant document because the source-required container/document was absent.
- Updated only the tenant auth/schema fields needed for alignment:
  - `apiKey`
  - `apiKeyHash`
  - `apiKeyMeta`
  - `updatedAt`

Public-safe result:

- Tenant found after alignment: yes.
- Tenant document created: yes.
- Approved key verified before alignment: false.
- Approved key verified after alignment: true.
- Cosmos status: 201.
- Secret values printed: no.

No other tenant was mutated.
