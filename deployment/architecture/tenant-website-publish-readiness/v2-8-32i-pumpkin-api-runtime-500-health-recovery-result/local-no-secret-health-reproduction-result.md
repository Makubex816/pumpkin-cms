# Local No-Secret Health Reproduction Result

Two local no-secret runs were performed from extracted corrected artifacts with appsettings/local/env files excluded.

## Reproduction Run

Artifact:

`.tmp/v2-8-32i/pumpkin-api-health-recovery-posix.zip`

Run directory appsettings-like file count: `0`

Result:

| Path | Status |
| --- | --- |
| `/health` | `500` |
| `/api/health` | `500` |

Generated local runtime log showed `System.ArgumentNullException` from JWT secret encoding during authentication middleware execution.

## Fixed Local Run

Artifact:

`.tmp/v2-8-32i/pumpkin-api-health-recovery-local-fixed-posix.zip`

Run directory appsettings-like file count: `0`

Result:

| Path | Status |
| --- | --- |
| `/health` | `200` |
| `/api/health` | `200` |

Both responses returned dependency-light health JSON with `providerStatus` set to `not_checked`.
