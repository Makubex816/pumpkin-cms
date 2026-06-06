# Production Enablement Settings

Generated: 2026-06-06

No settings were changed in this preflight.

## Function App Runtime Decision

Future production setting:

```text
FORM_DELIVERY_MODE=graph
```

Current safe setting:

```text
FORM_DELIVERY_MODE=no-email
```

Rollback setting:

```text
FORM_DELIVERY_MODE=no-email
```

## Public Endpoint URL

Final public endpoint:

```text
https://func-ice-static-contact-20260605.azurewebsites.net/api/static-contact
```

Preferred static build variable:

```text
NEXT_PUBLIC_STATIC_FORM_ENDPOINT=https://func-ice-static-contact-20260605.azurewebsites.net/api/static-contact
```

Compatibility aliases, if needed by a specific shell/validator context:

```text
STATIC_FORM_ENDPOINT=https://func-ice-static-contact-20260605.azurewebsites.net/api/static-contact
NEXT_PUBLIC_STATIC_FORM_ACTION=https://func-ice-static-contact-20260605.azurewebsites.net/api/static-contact
STATIC_FORM_ACTION=https://func-ice-static-contact-20260605.azurewebsites.net/api/static-contact
```

Verification flag:

```text
STATIC_FORM_ENDPOINT_VERIFIED=true
```

Set `STATIC_FORM_ENDPOINT_VERIFIED=true` only after human inbox confirmation and explicit production enablement approval.

## Server-Side Function Settings

These server-side setting names are required for Graph delivery and were previously staged. Values are not documented here:

- `MICROSOFT_GRAPH_TENANT_ID`
- `MICROSOFT_GRAPH_CLIENT_ID`
- `MICROSOFT_GRAPH_CLIENT_SECRET`
- `MICROSOFT_GRAPH_SENDER_USER`
- `ICE_RINK_RENTALS_LEAD_RECIPIENT`
- `MICROSOFT_GRAPH_SAVE_TO_SENT_ITEMS`
- `FORM_EMAIL_REPLY_TO_MODE`
- `FORM_EMAIL_SUBJECT_PREFIX`

Do not put Graph secrets in frontend or static output.

