# Azure Custom Domain Binding Result

Generated: 2026-06-06

## Result

| Hostname | Validation Method | Status | Error |
| --- | --- | --- | --- |
| `iceskatingrinkrentals.com` | DNS TXT token | Ready | none |
| `www.iceskatingrinkrentals.com` | CNAME delegation | Ready | none |

Final Azure hostname list:

```json
[
  {
    "domainName": "iceskatingrinkrentals.com",
    "status": "Ready",
    "errorMessage": null,
    "createdOn": "2026-06-06T15:40:13.863524+00:00"
  },
  {
    "domainName": "www.iceskatingrinkrentals.com",
    "status": "Ready",
    "errorMessage": null,
    "createdOn": "2026-06-06T15:51:52.753302+00:00"
  }
]
```

## Validation Handling

The Azure validation token was requested and used only for DNS validation. The token value was not printed into result docs, committed, or otherwise written to the repository.

## Static Deployment Boundary

No new static deployment or artifact rebuild was performed. The production custom domains were bound to the already deployed and already validated Azure Static Web App resource.
