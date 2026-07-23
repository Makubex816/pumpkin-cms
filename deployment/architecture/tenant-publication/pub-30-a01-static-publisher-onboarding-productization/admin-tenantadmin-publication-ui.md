# Admin and TenantAdmin publication UI

Focused source commit: `afb089ee40625c3651add122d396686c1f2b8d2e`.

The feature-gated publication center adds:

- TenantAdmin own-tenant hosting class, publication state, inventory, compatibility holds, hostname, domain stage, noindex/form readiness, release/job history, rollback/revoke eligibility, and audit views;
- SuperAdmin all-tenant inventory, immutable releases and jobs, resource/origin bindings, domain handoff/readiness, credential-reference metadata, holds, and audits;
- typed lifecycle action requests mapped to the plural publication-product API routes;
- accessible loading, empty, disabled, error, and confirmation states.

Two flags fail closed: the publication-product UI must be explicitly enabled, and customer execution has its own independently disabled flag. The API remains authoritative; browser-side flags do not grant permission. Credential values have no representable UI field and are not rendered.

The default PUB-30 deployment configuration keeps customer execution disabled. Admin source checks, type-check, tests, and production build passed from final technical source `aab6823bd265cf91e77868a6649dd984016837b9` in both clean roots. Builds retained four existing React hook warnings and one browser `fs`-resolution warning from the page converter; none was promoted as an error.

Raw Next output was root-sensitive and is not a distributable. The accepted packaging path used the same short canonical Windows build projection and exact `PUMPKIN_BUILD_ID` for each clean root, then ran the productized deployment-tree preparation. The two prepared 2,035-file trees were byte-identical. Their inventory SHA-256 is `fd54ad6607feff70a10c735438bb91567fbd355a23430afe38a6d1284f703339`; both deterministic ZIPs have SHA-256 `1a46dcc4f6d179538761cc5368c015197a6b2869bf6469e633b966beffcc6c7e`. No Admin deployment attempt was made.
