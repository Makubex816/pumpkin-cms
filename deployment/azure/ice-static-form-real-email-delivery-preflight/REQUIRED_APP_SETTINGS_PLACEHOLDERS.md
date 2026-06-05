# Required App Settings Placeholders

Generated: 2026-06-05

These are placeholders only. No app settings were created or changed.

## Delivery Mode

```text
FORM_DELIVERY_MODE=<dry-run|m365-graph>
STATIC_FORM_FORWARD_MODE=<dry-run compatibility until delivery dispatcher is implemented>
```

## Static Form Controls

```text
STATIC_FORM_ALLOWED_ORIGINS=https://iceskatingrinkrentals.com,https://www.iceskatingrinkrentals.com
STATIC_FORM_ALLOWED_SITE_KEYS=ice-rink-rentals
STATIC_FORM_MAX_BODY_BYTES=20000
STATIC_FORM_MAX_MESSAGE_LENGTH=4000
STATIC_FORM_RATE_LIMIT_MODE=<approved durable rate-limit mode>
STATIC_FORM_SPAM_PROTECTION_MODE=<approved spam-control mode>
STATIC_FORM_ALLOW_MISSING_ORIGIN=false
```

## Ice Routing

```text
ICE_RINK_RENTALS_STATIC_FORM_ENDPOINT_KEY=ice-rink-rentals-default
ICE_RINK_RENTALS_LEAD_RECIPIENT_REF=ICE_RINK_RENTALS_LEAD_RECIPIENT
ICE_RINK_RENTALS_LEAD_RECIPIENT_EMAIL=<approved recipient mailbox or distribution group>
```

## Graph Mail

```text
EMAIL_PROVIDER_MODE=m365-graph
FORM_EMAIL_FROM_ADDRESS=contact@iceskatingrinkrentals.com
FORM_EMAIL_REPLY_TO_MODE=<submitter-email-or-approved-static-reply-to>
FORM_EMAIL_SUBJECT_PREFIX=<approved subject prefix>
MICROSOFT_GRAPH_AUTH_MODE=<managed-identity-or-client-credential>
MICROSOFT_TENANT_ID=<tenant id>
MICROSOFT_GRAPH_CLIENT_ID=<managed identity client id or app client id>
MICROSOFT_GRAPH_CLIENT_SECRET -> <Key Vault reference or approved server-side secret, if needed>
MICROSOFT_GRAPH_CLIENT_CERTIFICATE=<Key Vault reference or approved certificate reference, if used>
MICROSOFT_GRAPH_SENDER_UPN=contact@iceskatingrinkrentals.com
MICROSOFT_GRAPH_SAVE_TO_SENT_ITEMS=<true-or-false>
MICROSOFT_GRAPH_SEND_TIMEOUT_MS=<approved timeout>
```

## Optional Future Controls

```text
STATIC_FORM_CAPTCHA_MODE=<none|turnstile|approved-provider>
STATIC_FORM_TURNSTILE_SECRET_KEY=<Key Vault reference, if approved>
STATIC_FORM_LOG_LEVEL=<approved level>
STATIC_FORM_LOG_PII=false
STATIC_FORM_ALERT_MODE=<approved monitoring mode>
```

## Frontend/Validator Context

Static build values remain public/non-secret only:

```text
NEXT_PUBLIC_STATIC_FORM_ENDPOINT=https://func-ice-static-contact-20260605.azurewebsites.net/api/static-contact
STATIC_FORM_ENDPOINT=https://func-ice-static-contact-20260605.azurewebsites.net/api/static-contact
STATIC_FORM_ENDPOINT_VERIFIED=<true only after the approved verification context passes>
```

Do not put Graph secrets, SMTP credentials, mailbox passwords, API keys, or connection strings in frontend/static build settings.
