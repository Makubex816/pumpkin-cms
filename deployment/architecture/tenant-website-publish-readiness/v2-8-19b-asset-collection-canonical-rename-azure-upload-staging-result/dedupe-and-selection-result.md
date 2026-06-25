# Dedupe and Selection Result

Dedupe methods:

- SHA-256.
- File size.
- Normalized filename.
- Source archive/context.
- Target slot suitability.

Result:

- The five original PNG candidates are duplicated across `ice-site-phase10a-pumpkin-ppec-rewrite-pack.zip` and `ice_homepage_media_input_images (1).zip`.
- The Phase 10A archive was selected as the primary source because it also carries media/page scaffold context.
- Preview-extracted files were duplicates of optimized/reference archive assets and were not selected as primary upload files.
- Service-areas optimized WEBP assets were kept as design/reference alternates, not selected for canonical PNG upload targets.
- PPEC weak candidates were rejected.

Selection result:

- Selected upload-staging copies: `10`.
- Ready-for-upload preflight rows: `7`.
- Contact replacement candidates pending owner approval: `3`.
- Unresolved target rows: `1`.

Contact replacement policy:

The three contact AI originals remain missing. The staged contact rows use recovered core Ice images referenced by contact preview evidence. They are not ready for upload until the owner approves them as replacements.
