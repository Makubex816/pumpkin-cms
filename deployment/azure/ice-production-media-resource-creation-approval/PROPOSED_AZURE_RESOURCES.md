# Proposed Azure Resources

Generated: 2026-06-04

## Scope

These proposed resources are for IceSkatingRinkRentals.com production media only.

RollerRinkRentals.com remains paused and is not in scope.

## Proposed Resource Set

| Resource type | Proposed name | Notes |
| --- | --- | --- |
| Resource group | `rg-ice-production-media` | Ice-specific and readable. |
| Storage account | `iceskatingmedia` | Lowercase letters only, 15 characters, Azure-safe shape. |
| Blob container | `ice-rink-rentals-media` | Lowercase and hyphenated, aligned to the site slug. |
| Region | `eastus` | US East region proposal for the Ice production media origin. |

## Target Media Host

Future media URLs are planned to use:

```text
https://media.iceskatingrinkrentals.com
```

Target path pattern:

```text
ice-rink-rentals/assets/{assetId}/{checksum}/{safeFileName}
```

The target public URL pattern remains:

```text
https://media.iceskatingrinkrentals.com/ice-rink-rentals/assets/{assetId}/{checksum}/{safeFileName}
```

## Storage Account Availability

Azure Storage account names are globally unique. The proposed name `iceskatingmedia` meets syntax constraints, but this planning package did not and must not run a create command to prove global availability.

If a future approved creation command reports that `iceskatingmedia` is unavailable, stop and request approval for a revised name. Do not silently choose another name.

## Creation Boundary

This package proposes resource creation only.

The following remain separate approval gates:

- media upload
- public origin or access policy changes
- Cloudflare/DNS changes
- MediaAsset updates
- CMS writes
- static export or deployment
- media production URL readiness change
