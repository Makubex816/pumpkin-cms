# Generation Rules Result

Phase 2B-2 keeps generated packages deterministic and validator-ready.

## Implemented Rules

- stable route normalization with trailing slashes except root
- stable page file names from explicit page slugs or route-derived slugs
- stable media IDs from answers
- stable form IDs from answers
- canonical base URL generated from `domains.canonicalHost`
- default forbidden routes included: `/draft/`, `/preview/`, `/old/`
- generated SEO remains `noindex,nofollow`
- `seo.indexingFinalGate` remains `true`
- generated package `manifest.validation.externalMutationAllowed` remains `false`
- generated package version is `0.2.0`

## Field Catalog Alignment

The builder validates analytics, privacy, owner contact, and manual approval fields in answers. These are summarized in generated `README.md` and support reports, but not emitted as extra package JSON files until validator discovery and schemas authorize those files.
