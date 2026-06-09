# Home Page Decision Plan

## Current Evidence

`home` exists, is admin/public readable, published, and sitemap-included.

## Default Action

Adopt the existing `home` page if owner review confirms it matches the intended Roller homepage.

## Optional Future Update

A future write may update only owner-approved deltas for:

- page content blocks;
- layout references;
- search/metadata fields;
- SEO title/description/canonical if explicitly approved.

## Fields To Preserve By Default

- slug `home`;
- route `/`;
- existing page identity;
- tenant identity;
- published state;
- sitemap inclusion;
- theme;
- domain/site association.

## Required Owner Decision

The owner must decide whether existing `home` content is acceptable as-is or whether exact package-derived deltas should be applied.

## Abort Conditions

Abort any `home` update if:

- the update would overwrite the full page blindly;
- the command cannot preserve page identity;
- the command changes publish/sitemap state without explicit approval;
- the desired delta is not field-level and owner-approved.
