# Pumpkin Vegas Preview Host Readiness V2.8.62E

Decision: `package-derived immutable preview fixture`.

The shared starter App Service `app-pumpkin-starter-preview-centralus-001` is running in `rg-pumpkin-api-prod-centralus`. It currently has one tenant setting for Party Pros, one configured API key, two API URL settings, no preview-root override, and no configured host-route JSON. No value was printed.

The existing generic adapter loads deployment-bundled `preview-fixtures/{tenantId}/preview.json`, forces noindex/no-post on explicit preview routes, and needs no runtime API key. Party Pros is the current built-in custom-host fixture. Vegas does not yet have a bundled fixture, theme CSS, behavior profile, body-link/media-alias rewrite, raw-form no-post adapter, source-shaped chrome, or fixture redirect resolver.

Runtime CMS/API mode is not selected because Vegas pages are unpublished and the runtime key must remain dormant. V2.8.62F must generate its immutable fixture from the verified V2.8.62E backup and hash-pinned CR fidelity assets.

## Trusted CR Inputs

- Adapter SHA-256: `F123C330C3C4553159F0E8B5EB07FE614DB06462B27715A91B68DEE2166D5D6F`

| Stylesheet | Bytes | SHA-256 |
| --- | ---: | --- |
| `header.css` | 4948 | `FC217EF7A4021CA7CD4F11CB7F7D3BD186E897835A4FE9F18A74F84FA35A0AE8` |
| `styles.css` | 27887 | `CBB5B50172CC69F14B8A6F246ACC777565DC6EEDE9B9BCECABB2F47843DF61AF` |
| `tailwind-compiled.css` | 23170 | `9F4D3928730D50052A3C264C26084BBCED136BF5F541A58CBE149826D2722899` |
| `pumpkin-fidelity-adapter.css` | 1154 | `3E3C3E5086BF40DBD34049DF140EE4273E14BE7C045813EA9B1BD480CF4A3356` |

Uploaded package JavaScript remains nonexecuting. Only the audited Pumpkin fidelity adapter may be allowlisted.

## Required Repairs

- Generate the Vegas preview.json fixture from the V2.8.62E backup; no Vegas fixture currently exists in source.
- Rewrite HTML href/src/srcset/style/data-fallback references with a parsed DOM and the 473-alias to 302-blob map; current raw HTML rendering does not prefix body links or resolve aliases.
- Build one hash-reviewed Vegas theme CSS file in source order and rewrite CSS url() values through the same alias map; current fixtures accept one CSS path.
- Add an allowlisted trusted behavior profile for the audited age gate, mobile menu, quiz, query prefill, no-post form UI, external-navigation hold, and image fallbacks; raw Blog HTML currently has no such adapter.
- Render source-shaped header/footer chrome for the Vegas profile; the generic Pumpkin chrome is not package-fidelity proof.
- Resolve all three fixture redirects before rendering and preserve the source/target/status ledger; /preview is intentionally excluded from the singleton API-key redirect middleware.
- Validate all 57 physical forms and 65 effective mappings against the 32 FormDefinitions while forcing local no-post behavior; the existing no-op covers structured blocks, not raw package forms.

## Settings And Host Boundary

V2.8.62F requires no appsetting mutation for `/preview/strip-club-near-me-vegas`. Preserve the Party Pros tenant and key settings. Do not activate the Vegas runtime key.

A Vegas custom host is outside V2.8.62F. The current singleton tenant/key model cannot safely serve both Party Pros and Vegas runtime redirects. Future host work requires host-aware tenant selection and per-tenant secret references, then separate DNS/TLS approval.
