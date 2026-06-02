# Frontend Preview Checklist

Local frontend base checked: `http://localhost:3002`

Homepage preview:

```json
{
  "reachable": true,
  "status": 200,
  "containsIceSignal": true,
  "containsContactSignal": true,
  "url": "http://localhost:3002/"
}
```

Contact preview:

```json
{
  "reachable": true,
  "status": 200,
  "containsIceSignal": true,
  "containsContactSignal": true,
  "url": "http://localhost:3002/contact"
}
```

Both local frontend probes returned HTTP 200 after the CMS /contact readback passed.
