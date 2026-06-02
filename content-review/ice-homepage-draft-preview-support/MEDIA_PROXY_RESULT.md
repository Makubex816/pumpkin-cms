# Media Proxy Result

## Implementation

A tenant-scoped rewrite was added in apps/ice-rink-web/next.config.js:

- Source: /media/ice-rink-rentals/:path*
- Destination: Pumpkin API /media/ice-rink-rentals/:path* using the configured API base URL or http://localhost:5064 fallback.
- Disabled in static render mode.
- Disabled in production unless PUMPKIN_MEDIA_PROXY_ENABLED=true is explicitly set.

## Probe Results

Existing 3002 process:

```json
{
  "status": 200,
  "contentType": "image/png",
  "length": "3607110"
}
```

Temporary 3004 validation server:

```json
{
  "status": 200,
  "contentType": "image/png",
  "length": "3607110"
}
```

The media proxy is not an arbitrary external proxy. It only matches the Ice tenant media path.
