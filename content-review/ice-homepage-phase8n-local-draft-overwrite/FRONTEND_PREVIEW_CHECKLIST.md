# Frontend Preview Checklist

Draft preview route: `http://localhost:3002/__preview/ice-rink-rentals/home`

```json
{
  "reachable": true,
  "status": 200,
  "length": 28222,
  "containsIce": true
}
```

Public route: `http://localhost:3002/`

```json
{
  "reachable": true,
  "status": 200,
  "length": 34129,
  "containsIce": true
}
```

Both probes returned HTTP 200, but manual browser review remains required. The readback currently lacks Phase 8N sectionVariant markers, so this draft should not be treated as production-render compatible until the model/contract issue is fixed.
