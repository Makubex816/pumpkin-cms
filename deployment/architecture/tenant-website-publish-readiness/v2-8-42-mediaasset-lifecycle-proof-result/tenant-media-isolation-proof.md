# Tenant Media Isolation Proof

Tenant target:

- Tenant: `ice-rink-rentals`.
- Storage account: `iceskatingmedia`.
- Container: `ice-rink-rentals-media`.
- Tenant prefix: `ice-rink-rentals/assets/`.
- Proof prefix: `ice-rink-rentals/assets/__pumpkin-proof/v2-8-42/`.

Source repair isolation:

- MediaAsset cleanup route is tenant-scoped.
- The data layer deletes by resolved record id and tenant partition.
- The route does not delete blobs.

Runtime isolation:

- No non-proof blob prefix was mutated.
- No live MediaAsset record was created or mutated.
- Admin UI media proof used tenant `ice-rink-rentals` list calls only.
