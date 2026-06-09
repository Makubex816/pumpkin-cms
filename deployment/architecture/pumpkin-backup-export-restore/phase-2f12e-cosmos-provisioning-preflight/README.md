# Phase 2F-12E Cosmos Provisioning Preflight

## Objective

Create the no-mutation Cosmos provisioning preflight and metadata-endpoint readiness package for the future IceSkatingRinkRentals.com Cosmos provider target.

## Result

This package defines:

- owner-confirmed Azure subscription/resource group/account/database/container planning;
- Cosmos backup policy decision points;
- partitioning and tenant isolation;
- RBAC and access model;
- local-dev and live profile prerequisites;
- non-secret provider metadata endpoint readiness;
- provider resolver integration requirements;
- Ice data seed/migration prerequisites;
- rollback and abort plan;
- validation gates;
- next provisioning approval prompt.

## Key Decision

If no existing Ice database/provider source is found, Azure Cosmos DB remains the selected target provider.

## Boundary

This is a no-mutation preflight. No Cosmos provisioning, Azure mutation, database export/import, CMS write, protected config read, secret export, deployment, Search Console/indexing action, or live-page publication occurred.
