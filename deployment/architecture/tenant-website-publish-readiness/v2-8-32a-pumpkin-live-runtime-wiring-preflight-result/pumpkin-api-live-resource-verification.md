# Pumpkin API Live Resource Verification

## Scope

This check used Azure metadata-only inventory commands. It did not call production API endpoints, health endpoints, or contact write paths.

## Commands and results

| Check | Result |
| --- | --- |
| Account metadata | Active subscription `ff887def-fd83-4a19-9298-13d4b1687873`, state `Enabled`. |
| Web Apps | `az webapp list` returned `[]`. |
| Function Apps | Only `func-ice-static-contact-20260605` returned. |
| Static Web Apps | `swa-ice-static-staging` and `swa-ice-static-isolated-staging` returned. |
| General resource search | No `pumpkin-api` Web App/App Service resource returned. |

## Candidate URL handling

The repo contains a publish-profile hint for `pumpkin-api-cdg2d3dwfpbbdygn.centralus-01.azurewebsites.net`. That URL was not called, and the publish profile was not read in full because publish profiles may contain protected deployment material.

Current classification for the candidate URL: unverified/stale. It must not be used as the binding target until a later approved phase verifies a matching live resource through safe metadata and then approved runtime checks.

## Conclusion

No live Pumpkin API Web App/App Service host is visible in the active subscription metadata. Production contact persistence cannot be safely enabled because there is no verified live API target to receive `POST /api/forms/ice-rink-rentals/entries` and persist to Cosmos.

The next phase should answer one question before any contact binding: where is the live Pumpkin API runtime, or does it need to be created/exposed?
