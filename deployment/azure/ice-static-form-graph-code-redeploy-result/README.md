# Ice Static Form Graph Code Redeploy Result

Generated: 2026-06-05

## Result

The existing Ice static form Azure Function was redeployed with the Graph-capable code package while remaining in dry-run/no-email mode.

Endpoint:

```text
https://func-ice-static-contact-20260605.azurewebsites.net/api/static-contact
```

Function App:

```text
func-ice-static-contact-20260605
```

Deployment id:

```text
5989b4ef54af46c2b3d0a2e3de49c9b7
```

## Verification

Local package:

```text
npm run check -> pass
npm test -> pass
```

Post-redeploy HTTPS:

```text
OPTIONS -> 204
valid frontend payload -> 200
valid legacy payload -> 200
invalid email -> 400
unknown routing -> 400
unknown recipient -> 400
oversized message -> 400
honeypot -> 400
unapproved origin -> 400
```

## Dry-Run Status

```text
STATIC_FORM_FORWARD_MODE dry-run = true
FORM_DELIVERY_MODE graph active = false
Microsoft Graph app setting name count = 0
```

No real email was sent. No Microsoft 365, Graph app/RBAC, Graph credential, CMS, MediaAsset, Cloudflare, static deployment, or Roller work occurred.

Contact form production readiness remains:

```text
no
```

