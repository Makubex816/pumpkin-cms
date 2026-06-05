# Option C: Azure CDN Or Azure Front Door

## Summary

Use an Azure-native delivery layer, such as Azure Front Door or Azure CDN, to serve the uploaded Blob media. Cloudflare could then point at that Azure edge layer if the project still wants Cloudflare as the public DNS/proxy layer.

## Required Future Changes

These are future actions only and were not executed:

- approve Azure Front Door or Azure CDN resource creation/configuration
- approve origin configuration for `iceskatingmedia`
- approve path mapping so public URLs omit the storage container segment while origin requests include it
- approve Azure custom domain or Cloudflare DNS pointing to the Azure edge hostname
- approve HTTPS certificate validation
- approve cache rules, purge plan, and validation plan
- approve later MediaAsset record updates after public URLs work

## Security Tradeoffs

Pros:

- Azure-native integration with Blob Storage
- Azure Front Door can cache and accelerate Blob content
- Azure Front Door Premium can use Private Link for supported origins
- central Azure edge configuration may be easier to govern in Azure-first environments

Cons:

- additional Azure resources, cost, and deployment surface
- private containers still need an explicit data access strategy such as SAS or an app/proxy layer; Private Link secures network path but does not by itself make private Blob data anonymously readable
- adding Cloudflare in front of Azure Front Door can create double-edge complexity
- still requires DNS/custom-domain validation and path mapping

## Compatibility

Supports the locked target URL pattern if the Azure delivery route maps:

```text
/ice-rink-rentals/assets/{assetId}/{checksum}/{safeFileName}
```

to the Azure Blob origin path that includes:

```text
/ice-rink-rentals-media/
```

## Stable Public Image URLs

Supported after custom domain and route mapping are configured.

## Secrets

Not required for public Blob-backed delivery.

May be required if the Blob origin remains private and the chosen Azure delivery path uses SAS or another authorization mechanism.

## Cloudflare/DNS

DNS is required for `media.iceskatingrinkrentals.com`.

Cloudflare proxying is optional if Azure Front Door or Azure CDN terminates the public media hostname directly. If Cloudflare remains the public edge, Cloudflare and Azure HTTPS/certificate behavior must be validated together.

## MediaAsset Updates

Required later, after the Azure edge URL returns successful public responses.

No MediaAsset records were written in this diagnostic run.

## Fit For Current Project

This is reasonable if the team wants Azure-native edge delivery, Azure WAF features, or future private-link architecture. For the immediate public marketing image need, it is more infrastructure than Option A.

