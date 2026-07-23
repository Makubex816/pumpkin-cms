# Public-form contract productization

The API source generalizes the A02/A03 ticketed form contract across publication lifecycle:

- tickets bind tenant, publication, revision, release/artifact identity, origin, form mapping, issuer/audience, ticket version, and replay-protection generation;
- issuance and submission require an active publication, accepted immutable release/artifact, authorized origin, enabled tenant/form mapping, and permitted product execution;
- persisted FormEntry metadata records publication/release/artifact and ticket-version lineage without creating a second lead store;
- promotion, supersession, revoke, rollback, and restore advance or validate replay state;
- safe canonicalization, rate policy, denial responses, and observability remain payload-free;
- Cosmos and Mongo use the same persistence contract.

Focused source tests cover exactly-one behavior, concurrency, replay, changed-payload conflict, expiry, wrong origin, revoked publication, superseded release, disabled tenant, invalid mapping, and restored-publication replay protection. The final locked build and tests passed for Mongo-enabled and Cosmos-only provider graphs in both clean roots with zero warnings and zero errors. The provider inventories were stable: Mongo-enabled SHA-256 `497032d6ec0256c98427547da0cc663eb3eb2611e41f28f0a217f2cef01e3d63` across 134 files, and Cosmos-only SHA-256 `eca76e2d9958e96d7a17ed3f0116ef3eee7354d8009c8d4c2ee4d3d8b7d658a1` across 122 files. The Cosmos-only graph contained no Mongo driver.

The existing one synthetic FormEntry remains the entry baseline. PUB-30 issued no ticket, made no form POST, sent no email, and created no additional FormEntry. CAPTCHA remains held. Live productized form regression is not claimed because the platform-secret security gate stopped all synthetic mutation.
