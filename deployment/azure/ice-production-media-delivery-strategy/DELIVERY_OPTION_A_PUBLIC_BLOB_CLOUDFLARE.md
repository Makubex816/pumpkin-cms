# Option A: Public Blob Read Plus Cloudflare

## Summary

Enable anonymous public read for the approved checksum-versioned media blobs, then serve them through Cloudflare at:

```text
https://media.iceskatingrinkrentals.com/ice-rink-rentals/assets/{assetId}/{checksum}/{safeFileName}
```

For this project, this option should use a Cloudflare routing layer that can map the public target path to the Azure Blob origin path that includes the container:

```text
public path: /ice-rink-rentals/assets/{assetId}/{checksum}/{safeFileName}
origin path: /ice-rink-rentals-media/ice-rink-rentals/assets/{assetId}/{checksum}/{safeFileName}
```

## Required Future Changes

These are future actions only and were not executed:

- approve Azure account anonymous Blob access if organization policy permits it
- approve container public access as `blob` rather than `container` to avoid anonymous listing
- approve Cloudflare DNS for `media.iceskatingrinkrentals.com`
- approve Cloudflare proxy/routing, likely Cloud Connector or Origin Rules plus URL Rewrite
- validate target media URLs with anonymous `HEAD`/`GET`
- approve later MediaAsset record updates after delivery is confirmed

## Azure Requirements

Azure anonymous Blob access requires both layers to permit public read:

- storage account `allowBlobPublicAccess` must allow anonymous access
- container public access must be set, preferably to `blob` for blob read without anonymous container listing

The current state blocks this option:

```text
allowBlobPublicAccess: false
container publicAccess: null
```

## Cloudflare Requirements

Future Cloudflare configuration must handle both hostname and path mapping.

Potential approaches:

- Cloudflare Cloud Connector for Azure Blob Storage, with URL Rewrite to inject the Azure container segment
- proxied DNS plus Origin Rules for Host header/DNS override and URL Rewrite
- Worker-based routing without private Blob auth, if a Worker is preferred for rewrite control

Cloudflare Cloud Connector currently requires proxied DNS and a publicly accessible storage bucket/container. It can route to Azure Blob Storage but does not itself make a private Blob container readable.

## Security Tradeoffs

Pros:

- no secrets in static HTML
- no SAS lifecycle in public markup
- simple stable URLs
- checksum-versioned immutable paths reduce cache invalidation risk
- public access can be limited to blob reads instead of container listing

Cons:

- origin objects are publicly readable by direct Azure Blob URL unless separate network/policy controls are later added
- public access may conflict with stricter storage security policies
- Cloudflare-only protection is not the same as private origin authorization unless origin access is restricted separately

## Compatibility

Supports the locked target URL pattern only if a Cloudflare rewrite/routing layer maps the path to the Azure container-backed origin path.

A plain CNAME to the Blob endpoint is not sufficient for the locked target URL pattern because the Blob service URL includes the container segment.

## Stable Public Image URLs

Supported.

This is the simplest fit for static HTML image references because the URLs can be stable, public, cacheable, and free of query-string secrets.

## Secrets

Not required for static HTML or delivery if the blobs are public.

Azure administrative changes may require privileged approval in a future gate, but no storage keys, connection strings, or SAS URLs should be printed.

## Cloudflare/DNS

Required in a future explicit approval.

No Cloudflare or DNS changes were made in this diagnostic run.

## MediaAsset Updates

Required later, after the target media URLs return successful public responses.

No MediaAsset records were written in this diagnostic run.

