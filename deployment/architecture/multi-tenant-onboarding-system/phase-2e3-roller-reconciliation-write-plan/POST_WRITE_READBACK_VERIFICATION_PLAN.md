# Post-Write Readback Verification Plan

## Purpose

After any future approved write execution, verify that only approved entities changed and that hard-stop boundaries remain intact.

## Required Readback

| Area | Verification |
| --- | --- |
| Tenant | target tenant still active and unchanged unless approved |
| `home` | expected fields match approved delta; slug/route/publish/sitemap state preserved unless approved |
| `contact` | expected fields match approved delta; form recipient behavior matches approved plan |
| `service-areas` | created only once; slug, route, title, content, SEO, publish state, and sitemap state match approval |
| `roller-rink-rentals` | unchanged unless owner-approved action was included |
| Sitemap | no accidental entry additions/removals unless approved |
| Media | no MediaAsset writes unless separately approved |
| Import runs | no unexpected import run side effects |
| Theme | unchanged unless approved |

## Required Negative Checks

Confirm no accidental changes to:

- unrelated tenants;
- unrelated pages;
- draft/test page;
- media assets;
- form recipient records;
- Azure, Cloudflare, DNS, deployment, email, Search Console, indexing, or live-page state.

## Failure Handling

If readback fails, stop. Do not continue to static generation, deployment, indexing, or live-page publication. Use rollback capture and owner review to decide a recovery path.
