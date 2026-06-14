# Media Manifest Requirements

Media manifests must include:

- media reference IDs;
- source/provenance refs;
- alt text readiness;
- licensing/owner approval ref;
- delivery provider profile ref;
- Backup Center evidence ref;
- Runtime QA validation ref;
- rollback/abort handling.

Media manifests must not include:

- raw binary assets in governance fixtures;
- storage keys;
- SAS URLs;
- connection strings;
- private media bucket/container credentials;
- MediaAsset write instructions.

Future MediaAsset writes remain separately gated.
