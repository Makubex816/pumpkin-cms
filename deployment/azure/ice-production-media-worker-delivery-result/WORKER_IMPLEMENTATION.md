# Worker Implementation

Date: 2026-06-05

## Local Source

Created:

```text
deployment/azure/ice-production-media-worker-delivery-result/worker/index.mjs
```

The Worker source contains no secrets, keys, connection strings, SAS URLs, CMS references, or protected config references.

## Behavior

The Worker is scoped for:

```text
host: media.iceskatingrinkrentals.com
path prefix: /ice-rink-rentals/assets/
methods: GET, HEAD
```

Rewrite target:

```text
incoming: https://media.iceskatingrinkrentals.com/ice-rink-rentals/assets/{assetId}/{checksum}/{safeFileName}
origin:   https://iceskatingmedia.blob.core.windows.net/ice-rink-rentals-media/ice-rink-rentals/assets/{assetId}/{checksum}/{safeFileName}
```

The Worker:

- rejects other hosts or paths with `404` if invoked outside the approved scope
- rejects non-GET/HEAD methods with `405`
- does not forward cookies or authorization headers to Azure Blob Storage
- forwards only safe public read headers needed for image delivery and caching
- does not forward query strings, preventing accidental forwarding of secret query parameters
- sets `Cache-Control: public, max-age=31536000, immutable`
- removes any `Set-Cookie` header from the origin response

## Deployment Result

Worker script deployed:

```text
script name: ice-media-delivery
status: OK
```

Syntax check:

```text
node --check deployment/azure/ice-production-media-worker-delivery-result/worker/index.mjs
result: passed
```

The Worker route itself is scoped to the approved path pattern:

```text
media.iceskatingrinkrentals.com/ice-rink-rentals/assets/*
```
