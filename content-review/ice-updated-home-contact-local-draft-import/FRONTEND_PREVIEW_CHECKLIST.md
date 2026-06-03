# Frontend Preview Checklist

Probed only if the frontend was reachable; no browser automation, screenshot, static generation, or deploy was performed.

- Homepage draft preview: `http://localhost:3002/__preview/ice-rink-rentals/home`

```json
{
  "reachable": true,
  "status": 200,
  "length": 28222,
  "containsIceSignal": true,
  "containsContactSignal": true
}
```

- Contact public route: `http://localhost:3002/contact`

```json
{
  "reachable": true,
  "status": 200,
  "length": 48798,
  "containsIceSignal": true,
  "containsContactSignal": true
}
```

Manual browser review remains required before any static regeneration or production/indexing work.
