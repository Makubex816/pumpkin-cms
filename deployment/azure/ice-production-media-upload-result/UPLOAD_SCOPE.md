# Upload Scope

Generated: 2026-06-05

## Approved Scope

Approved source:

```text
apps/pumpkin-api/.local-media/ice-rink-rentals/2026/06/
```

Approved storage account:

```text
iceskatingmedia
```

Approved Blob container:

```text
ice-rink-rentals-media
```

Approved blob path pattern:

```text
ice-rink-rentals/assets/{assetId}/{checksum}/{safeFileName}
```

Approved media count:

```text
9
```

## Upload Settings

All uploaded files used:

```text
Content-Type: image/png
Cache-Control: public, max-age=31536000, immutable
Auth mode: login
Overwrite: false
```

The cache-control value is appropriate for checksum-versioned immutable paths and was documented in the prior media upload command plan.

## Explicitly Out Of Scope

- files outside the approved 9-item inventory
- raw content-review inputs
- alternate blob paths
- alternate storage accounts
- alternate containers
- key auth
- connection strings
- SAS URLs
- Cloudflare/DNS changes
- CMS writes
- MediaAsset writes
- deployment
- email/Microsoft 365 work
- Roller work
