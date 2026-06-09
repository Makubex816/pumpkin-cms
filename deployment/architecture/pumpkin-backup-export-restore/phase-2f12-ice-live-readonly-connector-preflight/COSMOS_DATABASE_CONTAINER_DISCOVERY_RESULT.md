# Cosmos Database And Container Discovery Result

## Result

Cosmos database/container discovery was not run because no Cosmos account was visible in the active subscription.

## Blocker

A candidate Cosmos account name and resource group are required before safe read-only database/container listing can proceed.

## Not Performed

- No Cosmos SQL database listing.
- No Cosmos container listing.
- No document query.
- No document export.
- No key listing.
- No connection-string retrieval.
- No Azure mutation.

## Next Requirement

The owner/operator must provide or expose, through safe env presence and Azure RBAC, the live database provider/account scope before live connector execution can be approved.
