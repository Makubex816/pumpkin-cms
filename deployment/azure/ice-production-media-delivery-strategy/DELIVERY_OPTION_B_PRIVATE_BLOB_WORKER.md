# Option B: Private Blob Plus Cloudflare Worker

## Summary

Keep Azure Blob anonymous access disabled and serve media through a Cloudflare Worker or equivalent edge proxy. The Worker would receive requests for:

```text
https://media.iceskatingrinkrentals.com/ice-rink-rentals/assets/{assetId}/{checksum}/{safeFileName}
```

and fetch from the private Azure Blob origin using a server-side authorization method.

## Required Future Changes

These are future actions only and were not executed:

- approve Cloudflare DNS and Worker route for `media.iceskatingrinkrentals.com`
- approve Worker code and deployment
- approve a secret strategy, such as a narrowly scoped SAS stored as a Worker secret or another server-side signing path
- approve path rewrite from public path to Azure container-backed origin path
- approve cache behavior and validation plan
- approve later MediaAsset record updates after target URLs work

## Security Tradeoffs

Pros:

- Azure Blob can remain private to anonymous direct requests
- no SAS token or storage secret needs to appear in static HTML
- Worker can enforce path allowlists, methods, cache headers, and response header cleanup

Cons:

- requires secret material in Cloudflare or another server-side layer
- introduces Worker code, deployment, routing, monitoring, and rollback surface
- requires secret rotation planning
- can be harder to validate than direct public immutable assets
- edge caching must be designed carefully to avoid private-response cache mistakes

## Compatibility

Supports the locked target URL pattern if the Worker rewrites:

```text
/ice-rink-rentals/assets/{assetId}/{checksum}/{safeFileName}
```

to:

```text
/ice-rink-rentals-media/ice-rink-rentals/assets/{assetId}/{checksum}/{safeFileName}
```

before fetching Azure Blob.

## Stable Public Image URLs

Supported.

The browser-facing URL can stay stable and clean. The origin authorization stays server-side.

## Secrets

Required.

The exact mechanism must be approved separately. Secret values must not be committed, printed, embedded in static HTML, or included in reports.

## Cloudflare/DNS

Required in a future explicit approval.

This option requires Cloudflare Worker deployment or equivalent edge compute. No Worker or DNS changes were made in this diagnostic run.

## MediaAsset Updates

Required later, after the Worker-backed URLs return successful public responses.

No MediaAsset records were written in this diagnostic run.

## Fit For Current Project

This is a strong security option if anonymous public Blob read is disallowed by policy. It is heavier than needed for public marketing imagery and adds operational risk compared with public checksum-versioned blobs behind Cloudflare.

