# Known Limitations

- Provider resolver is fixture/local only.
- CMS/API endpoint is deferred.
- No live runtime provider metadata is resolved.
- No Azure/Cosmos source is discovered.
- No Cosmos account/database/container is provisioned.
- No CMS runtime is wired to Cosmos.
- No seed/migration is performed.
- No live database export is implemented.
- Ice is not fully backupable today.

## Next Needed Step

Create a no-mutation Cosmos provisioning preflight package using the owner decision that Cosmos is the target if no existing database source is found.
