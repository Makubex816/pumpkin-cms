# Phase 2F-10A Ice Source Wiring And Tenant Bundle Plan

Date: 2026-06-09

Target: IceSkatingRinkRentals.com

Scope: architecture and read-only discovery only.

## Result

Phase 2F-10A maps the Ice source-of-truth layers, defines local and live read profiles, defines the database and media backup source strategy, designs a tenant website bundle model, and creates the implementation backlog for DB/media backup connectors.

No implementation, database export, blob download, protected config read, secret export, CMS write, MediaAsset write, Azure mutation, Cloudflare mutation, DNS change, deployment, email action, Search Console/indexing action, or live-page publication occurred.

## Core Finding

Phase 2F-10 proved the current Backup Center can create and validate a standard Ice backup candidate, but database artifact proof and media binary proof are blocked.

Phase 2F-10A clarifies why:

- CMS content is available through Pumpkin API/admin read-only export.
- Code/docs identify the app database layer as provider-driven, with Cosmos DB and MongoDB support.
- Ice production architecture docs identify the CMS database provider as Azure Cosmos DB.
- Allowed Azure SQL discovery returned no SQL servers in the current subscription.
- Azure media storage is discoverable as `iceskatingmedia` with container `ice-rink-rentals-media`.

## Recommendation

Build DB/media backup connectors around explicit source profiles:

1. CMS/API read-only export for content records.
2. Database-provider discovery for Cosmos/Mongo/Azure SQL before any portable artifact work.
3. Azure Blob read-only media inventory/copy connector for `iceskatingmedia` / `ice-rink-rentals-media`.
4. Tenant website bundles that organize public output, CMS source, media metadata, blob copies, config inventory, backup reports, and restore reports without mixing standard backup artifacts into Git.

