# Remaining Media Delivery Blockers

Date: 2026-06-05

## Cloudflare Blocker

Cloudflare media delivery is blocked because the safe proxied-DNS plus Origin Rule path requires HostHeader override, and Cloudflare rejected it:

```text
not entitled to use the HostHeader override
```

Cloud Connector was not available through the probed ruleset phase:

```text
unknown phase "http_request_cloud_connector"
```

No Worker was deployed because Worker deployment was not approved.

## Current Media Delivery State

```text
media.iceskatingrinkrentals.com DNS/proxy/routing: not configured
Cloudflare path rewrite: not configured
Cloudflare media cache behavior: not configured
public media URL validation: 0/9 passed
```

## Still Blocked

- MediaAsset production URL updates are not done
- strict validators have not been rerun against the production media domain
- contact form production readiness remains `no`
- Azure staging readiness remains `no`
- main-site DNS cutover remains `no`
- production/indexing readiness remains not live-ready

## Required Future Resolution

Use one explicitly approved future path:

- enable or use a Cloudflare product/API path that can route Azure Blob with the correct origin Host header/SNI and container path rewrite
- configure Azure Storage custom domain/HTTPS behavior through an approved Azure change, then revisit Cloudflare media DNS/rules
- approve a Worker-based media proxy/rewrite path if Cloudflare rules cannot perform the required origin behavior

Any future run must still avoid root/apex DNS changes, `www` changes, CMS writes, MediaAsset writes, deployment, email/Microsoft 365 work, and Roller work unless separately approved.
