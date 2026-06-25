# Risk and Open Decisions

## Resolved In V2.8.19E

- Azure media account, resource group, and container are resolved and verified read-only.
- Container public access is confirmed as `blob`.
- Static website is confirmed disabled and not a usable endpoint for this packet.
- Public base URL is the blob container URL.
- Cache-control and overwrite policies are resolved.
- No exact name collisions exist for planned canonical target paths at the time of read-only listing.

## Open Decisions

| Decision | Current state | Impact |
| --- | --- | --- |
| Upload execution approval | false | No upload can occur until a future explicit approval changes this. |
| Contact replacement assets | not approved | 3 contact visual rows remain excluded. |
| Public URL HEAD readback | not run | Future approval should explicitly allow it after upload if required. |
| Source integration | not performed | Public site cannot reference new Azure media URLs until a later approved source/content integration phase. |
| Isolated staging preview | not approved | Preview remains a later separate boundary. |
| Production-bound deploy | blocked | No production-bound deploy path is open. |

## Risk Notes

Existing hashed assets under `ice-rink-rentals/assets/...` may represent a previous media upload generation. They do not collide with the planned canonical names, but future upload execution should still re-list the prefix immediately before upload and fail if any planned canonical path appears.
