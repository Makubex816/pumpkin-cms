# Tenant Media Rendering Standard V2.8.61OSB

Tenant starter previews should render media from tenant-scoped public URLs or sanitized fixture URLs.

Standard affirmed by OSB:

- Preserve source-relative media paths to avoid duplicate filename collisions.
- Do not flatten nested filenames during preview/runtime mapping.
- Do not use storage keys, listKeys, or SAS for public page rendering proof.
- Do not require CMS mutation to repair a bundle-only preview fixture.
- Keep renderer behavior generic and tenant-neutral.
- Treat nested `content.media.publicUrl` and `content.media.url` as valid image sources only after URL safety checks.
- Keep forms disabled/no-post unless a separately approved form phase explicitly enables live submit.

This standard was applied to Party Pros without Airstrip action and without Party Pros CMS/media mutation.
