# Universal static publisher proof

The repository implementation accepts a canonical tenant/publication snapshot and emits a deterministic artifact, manifest, routes, redirects, media aliases, public-form mappings, themes, navigation, age-gate behavior, indexing/form mode, source hashes, compatibility metadata, and predecessor/rollback identity.

Safety properties are encoded in the product:

- every PUB-30 candidate remains noindex and emits disallow-all robots policy;
- sitemap routes remain absent while indexing is held;
- `PREVIEW_NO_POST` omits form transport;
- `PUBLIC_FORMS_LIVE` uses the ticketed public client and carries no reusable credential;
- route collisions, unsafe identifiers, unknown blocks, forbidden data, and attribution hash mismatch fail closed;
- artifact creation performs no live I/O;
- deployment requires an injected adapter and an explicit approval reference.

The current validator covers multiple synthetic tenants, deterministic rebuilds, collision and unknown-block handling, redirects, aliases, form mappings, noindex/empty-sitemap behavior, public client and preview modes, age gating, registries, jobs, deployment-plan safety, credential-provider boundaries, and current-tenant compiler probes.

The exact final source commit is `aab6823bd265cf91e77868a6649dd984016837b9`. Both clean roots produced the same 24-file candidate inventory with SHA-256 `ed33ad67abab8a04b08e6f91b5d3689269b5d0041c702003864fae6137a92f74`; the canonical candidate-index semantic SHA-256 is `8041bc2d1187104edd1a448dd92c31baa4edf5d21b1e11f7bca9a15848331b8e`.

The frozen deterministic deployment archives are:

- API ZIP SHA-256 `f616e5c0025e6d1022d7423b761d0df19c3d597e962c97f3fc94ce83d55c76e5`, with canonical tree inventory SHA-256 `66bf6dd14478ef4d3a37a3cc9755622fa18c216ed8a368941d7c224dc69ccd79`;
- Admin ZIP SHA-256 `1a46dcc4f6d179538761cc5368c015197a6b2869bf6469e633b966beffcc6c7e`, with canonical tree inventory SHA-256 `fd54ad6607feff70a10c735438bb91567fbd355a23430afe38a6d1284f703339`.

ZIP CRC, inventory, secret, credential-name, symlink, and private-path checks passed. No artifact described here was deployed.
