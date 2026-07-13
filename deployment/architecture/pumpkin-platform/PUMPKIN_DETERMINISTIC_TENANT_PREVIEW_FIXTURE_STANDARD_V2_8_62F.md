# Pumpkin Deterministic Tenant Preview Fixture Standard V2.8.62F

This standard defines package-derived immutable preview fixtures for tenants whose unpublished content must be reviewed without using live CMS data as the runtime source.

## Required Inputs and Integrity

- Pin the normalized package, source archive when available, fidelity evidence, backup manifest, compiler source, and schema by SHA-256.
- Emit source hashes, schema version, compiler version, tenant ID, immutable/preview-only flags, and a deterministic fixture payload hash.
- Exclude volatile timestamps from the hashed payload and prove a byte-identical independent rebuild.
- Validate with a versioned JSON Schema before build or rendering.

## Fidelity and Safety

- Fail closed on any unmapped route, redirect, media dependency, form instance, link, anchor, visible control, or accepted-deviation row.
- Never execute uploaded package JavaScript. Parse intended behavior and reproduce approved non-destructive behavior in audited Pumpkin code.
- Never embed credentials, runtime keys, cookies, JWTs, customer data, FormEntries, connection data, protected config, or media binaries.
- The fixture is a review artifact, never the authoritative CMS record source.

## Deployment Gate

- Require schema, count, secret, route, redirect, media, form, link, control, accessibility, type-check, build, and responsive browser proof before packaging.
- Any missing required media or failed local fidelity assertion stops deployment.
