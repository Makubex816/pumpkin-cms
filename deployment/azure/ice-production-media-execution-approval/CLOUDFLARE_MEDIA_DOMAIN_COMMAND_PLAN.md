# Cloudflare Media Domain Command Plan

Generated: 2026-06-04

## Scope

Future examples only. No Cloudflare credentials were read, no DNS records were changed, and no Cloudflare commands were run in this preparation pass.

## Target Domain

```text
media.iceskatingrinkrentals.com
```

## Placeholder Values

```text
<CLOUDFLARE_ZONE_ID>
<APPROVED_MEDIA_ORIGIN_HOST>
<CLOUDFLARE_DNS_RECORD_ID>
```

## Read-Only Checks First

Future DNS checks:

```powershell
Resolve-DnsName media.iceskatingrinkrentals.com
curl.exe -I https://media.iceskatingrinkrentals.com/
```

Future API-style read-only example, if explicitly approved and credentials are available through a runtime-only mechanism:

```powershell
curl.exe -sS `
  -H "Authorization: Bearer <CLOUDFLARE_TOKEN_RUNTIME_ONLY>" `
  "https://api.cloudflare.com/client/v4/zones/<CLOUDFLARE_ZONE_ID>/dns_records?name=media.iceskatingrinkrentals.com"
```

Stop point: review the existing DNS state before any change. Do not print token values.

## Future DNS Change Example

Run only after explicit approval for the exact Cloudflare/DNS action:

```powershell
curl.exe -sS -X POST `
  -H "Authorization: Bearer <CLOUDFLARE_TOKEN_RUNTIME_ONLY>" `
  -H "Content-Type: application/json" `
  --data "{\"type\":\"CNAME\",\"name\":\"media\",\"content\":\"<APPROVED_MEDIA_ORIGIN_HOST>\",\"proxied\":true}" `
  "https://api.cloudflare.com/client/v4/zones/<CLOUDFLARE_ZONE_ID>/dns_records"
```

Stop point: validate DNS, HTTPS, origin routing, cache headers, and rollback record before proceeding to MediaAsset updates.

## Cache And TLS Requirements

Future setup must confirm:

- HTTPS is valid for `media.iceskatingrinkrentals.com`
- media assets return `200`
- `Content-Type` is correct
- immutable cache headers are present for checksum paths
- no redirect loop exists
- no primary-site canonical behavior is applied to media assets

## Required Approval

Explicit approval is required before:

- reading Cloudflare credentials
- creating or changing DNS records
- changing cache/origin rules
- purging cache
- validating DNS as an execution step

## Current Run Result

No Cloudflare or DNS changes occurred.
