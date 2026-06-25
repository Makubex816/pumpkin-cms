# Isolated Staging Only Plan

All future visual recovery work must go through `swa-ice-static-isolated-staging` before any production-bound approval.

Required future isolated staging gates:

- backup-derived source builds locally
- all 9 required image binaries are present or intentionally replaced
- image paths work in local static output
- pages render image-rich experience for `/`, `/service-areas`, and `/contact`
- header, nav, footer, CTAs, and form behavior pass owner review
- mobile visual review passes
- SEO metadata and share images are reviewed
- no protected config, tokens, keys, connection strings, or SAS are required
- no production-bound target is touched

Production-bound deploy to `swa-ice-static-staging` remains a separate later approval.

