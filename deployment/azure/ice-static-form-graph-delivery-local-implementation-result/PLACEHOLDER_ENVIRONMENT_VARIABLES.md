# Placeholder Environment Variables

Generated: 2026-06-05

Placeholders only. No real values were created, read, or configured.

## Delivery Mode

```text
FORM_DELIVERY_MODE=graph
```

Rollback/default:

```text
FORM_DELIVERY_MODE=dry-run
```

## Microsoft Graph

```text
MICROSOFT_GRAPH_TENANT_ID=<Microsoft tenant id>
MICROSOFT_GRAPH_CLIENT_ID=<Microsoft Graph app client id>
MICROSOFT_GRAPH_CLIENT_SECRET -> <Key Vault reference or approved server-side secret>
MICROSOFT_GRAPH_SENDER_USER=contact@iceskatingrinkrentals.com
MICROSOFT_GRAPH_SAVE_TO_SENT_ITEMS=false
```

## Ice Routing

```text
ICE_RINK_RENTALS_LEAD_RECIPIENT=<approved recipient mailbox or distribution group>
ICE_RINK_RENTALS_STATIC_FORM_ENDPOINT_KEY=ice-rink-rentals-default
```

## Email Formatting

```text
FORM_EMAIL_REPLY_TO_MODE=<none|submitter-email|static>
FORM_EMAIL_REPLY_TO_ADDRESS=<approved static reply-to mailbox>
FORM_EMAIL_SUBJECT_PREFIX=<approved subject prefix>
```

## Existing Static Form Controls

```text
STATIC_FORM_ALLOWED_ORIGINS=https://iceskatingrinkrentals.com,https://www.iceskatingrinkrentals.com
STATIC_FORM_ALLOWED_SITE_KEYS=ice-rink-rentals
STATIC_FORM_MAX_BODY_BYTES=20000
STATIC_FORM_MAX_MESSAGE_LENGTH=4000
STATIC_FORM_RATE_LIMIT_MODE=<approved durable mode>
STATIC_FORM_SPAM_PROTECTION_MODE=<approved mode>
```

Do not place these values in frontend/static build output except for public endpoint URL and validator flags.

