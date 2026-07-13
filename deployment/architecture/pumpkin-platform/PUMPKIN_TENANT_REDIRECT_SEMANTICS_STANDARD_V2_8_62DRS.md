# Pumpkin Tenant Redirect Semantics Standard V2.8.62DRS

## Core Rule

Every source redirect declaration receives an explicit semantic disposition before live import. Source declaration count, persisted redirect count, and effective behavior count are separate facts.

## Required Dispositions

- `persisted_redirect`: meaningful redirect represented and read back exactly once.
- `canonical_noop`: source and target normalize to the same route with no lost query, fragment, host, scheme, case, slash, locale, index-file, canonical, SEO, or browser behavior; never persisted as a loop.
- `client_anchor`: fragment navigation retained on the client, not converted to a server redirect.
- `external_redirect`: meaningful host or scheme transition retained explicitly.
- `blocked_meaningful_redirect`: distinct intent the approved API operation cannot represent; fails closed.
- `cycle_invalid_redirect`: direct or multi-node cycle; fails closed and is never persisted.

The owning page's current slug equaling a redirect source does not make the redirect a no-op. Source and target must be semantically equivalent for that classification.
