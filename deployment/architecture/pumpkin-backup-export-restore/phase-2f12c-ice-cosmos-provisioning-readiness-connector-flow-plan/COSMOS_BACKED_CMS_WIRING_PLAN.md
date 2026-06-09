# Cosmos-Backed CMS Wiring Plan

## Purpose

Once Cosmos exists or is confirmed, Pumpkin CMS must be wired to use the Cosmos-backed provider for Ice production data. This plan records the future work without approving it.

## Required Wiring Areas

- database provider selection;
- Cosmos account/database/container configuration;
- auth mode and managed identity or secret-store strategy;
- CMS API runtime profile;
- tenant/site scope;
- local-dev fallback profile;
- admin/provider metadata endpoint;
- Backup Center provider resolver integration;
- validator and restore-plan source map integration.

## Readiness Gates

1. Cosmos source exists or provisioning approval completed.
2. Non-secret provider metadata endpoint is implemented.
3. Runtime config names are known without values.
4. Protected config values remain outside standard backup.
5. Local-dev profile still works without live Azure.
6. Read-only provider verification succeeds.
7. Data seed/migration preflight is approved before writes.

## Hard Stop

This phase does not change app settings, Function App settings, deployment config, CMS runtime, or any Azure resource.
