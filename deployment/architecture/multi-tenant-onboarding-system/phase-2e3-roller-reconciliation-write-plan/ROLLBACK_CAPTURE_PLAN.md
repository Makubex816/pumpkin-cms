# Rollback Capture Plan

## Purpose

Before any future CMS reconciliation write, capture enough before-state evidence to restore or manually repair the touched CMS records.

## Required Before-State Capture

| Entity | Required capture |
| --- | --- |
| Tenant/site/domain | sanitized tenant/site/domain summary and IDs |
| `home` | full readback of page identity, slug, route, content, metadata, published state, sitemap state |
| `contact` | full readback of page identity, slug, route, content, form config, metadata, published state, sitemap state |
| `service-areas` | proof of absence or full readback if newly found |
| `roller-rink-rentals` | full readback before any possible action |
| Form recipient | existing recipient config if storage is found |
| SEO/sitemap | before-state title, description, canonical, robots, sitemap flags |
| Media | media asset list and refs if a later media gate exists |

## Capture Storage

Store rollback evidence in a future ignored `.tmp` output package unless a later docs-only summary is approved. Do not stage raw payloads, secrets, protected config, or generated output.

## Rollback Strategy

- Prefer no-op/adopt decisions where possible.
- For updates, record before/after diff and a field-level reversal plan.
- For `service-areas` creation, rollback plan must include deletion or unpublish/removal path only if explicitly approved by the same future gate.
- If rollback cannot be scoped safely, block the write.

## Human Review

Rollback owner and evidence path must be named before execution approval.
