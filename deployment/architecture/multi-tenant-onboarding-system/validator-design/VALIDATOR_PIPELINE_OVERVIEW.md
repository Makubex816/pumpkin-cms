# Validator Pipeline Overview

Pipeline:

1. intake validation
2. JSON parse
3. schema validation
4. cross-file tenant/site consistency
5. route whitelist validation
6. preview/obsolete route exclusion
7. media URL validation
8. form endpoint validation
9. noindex/canonical/sitemap/robots validation
10. hidden public payload validation
11. secret scan
12. protected/generated/raw artifact scan
13. staging smoke test
14. production smoke test
15. indexing final hard stop validation

Each validator emits a machine-readable result and a plain-language summary.

