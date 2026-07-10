# Starter Renderer Repair Result

Status: repaired.

Source files changed:

- `apps/starter-app/src/components/PageRenderer.tsx`
- `apps/starter-app/src/lib/host-tenant-routing.ts`

Renderer repair:

- `PageRenderer` now maps nested media references into renderable image fields:
  - Hero and PrimaryCTA `content.media.publicUrl` or `content.media.url` to `mainImage`;
  - CardGrid card `media.publicUrl` or `media.url` to card `image`;
  - HowItWorks step `media.publicUrl` or `media.url` to step `image`.
- Alt text is taken from media `alt`, `title`, `caption`, or `description` when the block-specific alt field is empty.
- Unsafe local paths are not promoted; only absolute HTTP(S), protocol-relative, or root-relative image URLs are accepted.

Host route repair:

- The built-in Party Pros host route remains `disabled-preview` by default.
- Configured routes are read before built-ins so a future approved form phase can override behavior without source-only Party Pros special casing.

The repair is generic for future tenants and does not contain scattered Party Pros-only renderer logic.
