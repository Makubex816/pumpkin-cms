# Service Areas Write Plan

## Current Gap

The local Roller package expects a `service-areas` page at `/service-areas/`. Phase 2E-2 refreshed evidence returned admin 404, public 404, and no sitemap entry for `service-areas`.

## Future Create Intent

Create exactly one CMS page for:

- slug: `service-areas`
- route: `/service-areas/`
- title: `Service Areas`
- content source: validated local Roller package plus owner-approved copy
- tenant: existing adopted Roller tenant

## Default Safety Posture

The future create should default to:

- unpublished, if CMS supports draft/unpublished page state;
- not sitemap-included;
- no Search Console/indexing action;
- no static generation;
- no deployment;
- no live-page publication.

If the CMS cannot create the page safely without publishing it, the write must be blocked until a safe draft/preview path is proven.

## Required Before Create

- Owner confirms `service-areas` should exist.
- Fresh read-only preflight confirms no hidden, draft, archived, legacy, or conflicting `service-areas` record.
- Owner approves final route, title, canonical URL, metadata, robots posture, sitemap posture, and content source.
- Rollback capture is complete.
- Write command or implementation limits scope to only the new `service-areas` page.

## Post-Create Readback

After a future approved create, run readback verification for:

- slug;
- route;
- title;
- content blocks;
- SEO metadata;
- canonical URL;
- published state;
- sitemap inclusion;
- public readability;
- absence of accidental changes to `home`, `contact`, `roller-rink-rentals`, tenant, theme, media, and form recipient records.

## Abort Conditions

Abort before any future create if:

- a conflicting `service-areas` record appears;
- owner-approved content is missing;
- the write would publish the page without explicit approval;
- the write would modify unrelated pages;
- the request includes deployment, DNS, Azure, Cloudflare, email, Search Console, indexing, or live-page publication.
