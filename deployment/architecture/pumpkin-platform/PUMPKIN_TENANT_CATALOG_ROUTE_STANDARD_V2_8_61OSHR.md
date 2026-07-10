# Pumpkin Tenant Catalog Route Standard V2.8.61OSHR

## Scope

This standard applies when a tenant has catalog, category, event/use-case, or item-detail content.

## Route Contract

1. A catalog record must resolve at `/catalog`.
2. Catalog-capable tenant navigation must expose Catalog once, without duplicates.
3. Category cards must target category routes, not inquiry forms.
4. Event/use-case cards must target event routes when those pages exist.
5. Item cards must target dedicated item-detail routes.
6. Missing route data must fail visibly during validation rather than silently falling back to contact.
7. Source-compatible `.html` aliases may be supported, but canonical links should be extensionless.
8. Internal URLs must pass the starter's safe-href policy.

## Content Contract

- Catalog index blocks use structured item records with title, description, image, link, and category data.
- Search/filter controls operate on structured data and do not change route identity.
- Item, category, and event pages remain normal tenant Page records or compiled fixture Pages.
- Media references must use approved public URLs and must not require storage keys, SAS, or local paths.

## Validation Contract

Before acceptance, prove:

- complete source link and image graph inventory;
- zero broken internal targets in the accepted source graph;
- Catalog menu visibility;
- catalog/category/item HTTP 200 results;
- zero contact fallbacks in catalog-navigation cards;
- responsive rendering with no overflow or broken images;
- preview behavior and form behavior remain within their approved mutation boundaries.

## Persistence Contract

Compiled fixtures can establish a controlled runtime baseline, but they do not make CMS authoritative. A later persistence phase must reconcile existing records, avoid duplicate blind imports, prove readback and rollback, and preserve the accepted runtime until CMS-rendered parity is approved.

