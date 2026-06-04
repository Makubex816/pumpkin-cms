# Cloudflare Media Domain Planning

Generated: 2026-06-04

## Scope

This file plans the future Cloudflare media hostname gate.

No Cloudflare DNS records, cache rules, page rules, workers, or origin settings were changed.

## Target Hostname

```text
media.iceskatingrinkrentals.com
```

## Intended Path

```text
Browser
  -> Cloudflare media hostname
  -> Azure Blob Storage origin
```

## Cache Planning

Checksum-versioned image paths should be eligible for long-lived immutable caching after Blob upload and origin behavior are validated.

Mutable manifests or indexes, if introduced later, should use short TTL or no-cache behavior.

## Future Verification

After explicit approval and setup:

- confirm media hostname resolves correctly
- confirm HTTPS certificate coverage
- confirm Blob origin routing
- confirm cache headers
- confirm no unapproved image host appears in static output
- confirm rollback media paths remain available

## Required Explicit Approvals

Approval is required before:

- changing Cloudflare DNS
- configuring cache rules
- configuring origin behavior
- purging cache
- marking media domain readiness `yes`

## Current Status

Cloudflare media hostname configured: no.

DNS changed in this pass: no.

Cloudflare changed in this pass: no.

