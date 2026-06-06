# Function App Settings Result

Generated: 2026-06-06

## Settings Configured

| Setting name | Present | Value present |
| --- | --- | --- |
| `FORM_DELIVERY_MODE` | yes | yes |
| `MICROSOFT_GRAPH_TENANT_ID` | yes | yes |
| `MICROSOFT_GRAPH_CLIENT_ID` | yes | yes |
| `MICROSOFT_GRAPH_CLIENT_SECRET` | yes | yes |
| `MICROSOFT_GRAPH_SENDER_USER` | yes | yes |
| `ICE_RINK_RENTALS_LEAD_RECIPIENT` | yes | yes |
| `MICROSOFT_GRAPH_SAVE_TO_SENT_ITEMS` | yes | yes |
| `FORM_EMAIL_REPLY_TO_MODE` | yes | yes |
| `FORM_EMAIL_SUBJECT_PREFIX` | yes | yes |

## Mode

| Check | Result |
| --- | --- |
| Graph-related setting name count | `6` |
| `FORM_DELIVERY_MODE` no-email confirmed | yes |
| legacy `STATIC_FORM_FORWARD_MODE` dry-run still present | yes |
| Graph mode active | no |

The endpoint is Graph-configured but not Graph-active. The next live email test must switch `FORM_DELIVERY_MODE` to `graph` under a separate approval.

