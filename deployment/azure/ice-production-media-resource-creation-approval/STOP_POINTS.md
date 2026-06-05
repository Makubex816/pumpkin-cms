# Stop Points

Generated: 2026-06-04

## Required Future Stop Points

A future resource creation execution must stop:

1. before running any `az group create` command
2. after resource group creation and before storage account creation
3. if the storage account name `iceskatingmedia` is unavailable
4. after storage account creation and before Blob container creation
5. after Blob container creation and before any media upload
6. before changing storage public access settings
7. before changing container access policy
8. before generating or printing any key, connection string, or SAS URL
9. before Cloudflare/DNS work
10. before CMS or MediaAsset writes
11. before static export or deployment
12. before marking media production URL readiness `yes`

## Automatic Stop Conditions

Stop immediately if:

- Azure subscription context differs from the approved subscription
- Azure policy blocks the approved command
- resource names differ from this package
- a command would create a non-approved resource
- a command would create Cosmos resources
- a command would upload media
- a command would expose or print a secret
- protected config access is needed
- Roller appears in scope
- generated static artifacts would be staged
- raw images would be staged

## Scope Guard

Only IceSkatingRinkRentals.com production media resource foundation planning is in scope.

RollerRinkRentals.com remains paused.
