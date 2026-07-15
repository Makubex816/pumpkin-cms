# Production backfill and mapping proof

Backfill run: `identity-backfill-1624103eb98ee1e8`.

Tenant mappings:

- airstrip-club-las-vegas -> df5ea8973c8dbc9f118732414df1bf12
- ice-rink-rentals -> 4d83877bea7ed56cca3ac025994ea50f
- party-pros-philadelphia -> 3b975d1b9bf1933d779764cfbd964320
- strip-club-near-me-vegas -> b3735ec299501035e4fa751f80940368

Five legacy identities map one-to-one to five global UserAccounts and five memberships. Each tenant retains its canonical slug and primary TenantAdmin. Password-hash fingerprints and login emails compared equal; raw hashes are not present here.
