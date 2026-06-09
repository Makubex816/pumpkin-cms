# Non-Goals

Phase 2F-12J is a no-switch preflight package only.

## Hard Stops

- Do not switch Ice CMS runtime storage to Cosmos.
- Do not create, update, import, seed, or delete CMS records.
- Do not create or update MediaAsset records.
- Do not run database export, database import, Cosmos document export, or Cosmos document import.
- Do not download or copy media blobs.
- Do not read protected config files.
- Do not print secrets, tokens, keys, connection strings, cookies, auth headers, or secret-bearing values.
- Do not mutate Azure resources.
- Do not mutate Cloudflare, DNS, deployment settings, email, Microsoft 365, Search Console, or indexing.
- Do not publish live pages.

## Planning Boundary

This package may name non-secret configuration keys that future implementation may use. It must not provide secret values or require protected config access.

## Runtime Boundary

Provisioned Cosmos resources are not sufficient to enable runtime use. Runtime wiring requires a later implementation approval, followed by separate data seed or migration approval, readback verification, backup proof, and production switch approval.

