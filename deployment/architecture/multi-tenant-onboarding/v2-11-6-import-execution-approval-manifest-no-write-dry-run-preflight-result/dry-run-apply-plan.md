# Dry-Run Apply Plan

Status: created.

The dry-run apply plan is local evidence only. It does not write CMS/provider data, mutate Azure, create tenants, deploy, index, submit contact forms, or resume paused tenants.

Ice apply plan:

- Dry-run ID: `dry-run-ice-rink-rentals-carryforward-v2-11-2-v2-11-6`.
- Target mode: `future_import_candidate`.
- Would create tenant: `false`.
- Would map routes: `/`, `/service-areas`, `/contact`.
- Would map content refs: `v2-8-17d-sanitized-static-artifact`, `content:ice-home`, `content:ice-service-areas`, `content:ice-contact`.
- Would map media refs: `media:cloudflare-worker-media-delivery-reference`.
- Would map form config refs: `form:ice-contact-reference`.
- Would delete: none.
- Would write CMS/provider/Azure/deploy/index now: all `false`.

Roller apply plan:

- Dry-run ID: `dry-run-roller-rink-rentals-paused-preview-v2-11-2-v2-11-6`.
- Target mode: `blocked_no_import_no_resume`.
- Would create/update/delete: none.
- Would write CMS/provider/Azure/deploy/index now: all `false`.
- No-go: `tenant_paused_no_import`.

