# Redirect Endpoint Readiness Proof

Checked at `2026-07-13T15:52:37.392Z`.

## Route Activation

| Probe | Auth | HTTP | Result |
| --- | --- | ---: | --- |
| GET Admin redirect list | none | 401 | live and auth-gated |
| POST Admin validate with `{}` | none | 401 | live and auth-gated |
| GET API health | none | 200 | healthy |
| GET Vegas generic redirect list | SuperAdmin | 200 | count `0` |

## Non-Mutating Vegas Validation

Both approved payloads returned HTTP `400` with `source.invalid` and `target.invalid`. Normalized values remained empty because validation stopped before data access. Root cause: the deployed Linux build treated leading-slash internal paths as absolute file URIs.

The source was corrected locally to use explicit URI-scheme syntax detection and protocol-relative rejection. Focused tests and Release build pass, and a safe corrected package exists outside the repo. It is not live.

Status: `blocked_live_internal_redirect_validation_cross_platform_path_detection`.

Request accounting for the authenticated proof: one login POST, two non-mutating validation POSTs, two GETs, zero mutation requests, zero Airstrip requests, and no auth material persisted.
