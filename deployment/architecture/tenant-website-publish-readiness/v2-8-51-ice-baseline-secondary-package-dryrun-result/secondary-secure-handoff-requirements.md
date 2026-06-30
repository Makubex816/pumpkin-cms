# Secondary Secure Handoff Requirements

No secondary secrets were generated or included in V2.8.51.

Required future secure handoff fields for controlled secondary tenant creation:

- Secondary tenant ID and display name confirmation.
- TenantAdmin email.
- TenantAdmin initial password supplied outside the repo.
- Tenant/static API key generation and binding plan supplied outside the repo.
- Static contact runtime key, if a static contact endpoint is included.
- SWA deployment token for isolated deployment, if a future isolated Static Web App deploy is approved.
- SWA deployment token for production deployment, if a future production Static Web App deploy is approved.
- Provider credentials only if a future provider-backed contact or media workflow is approved.
- DNS registrar/provider credentials deferred until a separate DNS approval exists.
- Search Console/indexing access deferred until final indexing approval exists.

Required public package constraints:

- Public package must not contain password values.
- Public package must not contain tenant/static API key values.
- Public package must not contain bearer tokens, cookies, connection strings, SAS URLs, private keys, or provider credentials.
- Admin users must use `passwordSource`.
- Media must use public URL/path references only; do not include binary media.

