# Redacted Static Appsetting Contract Comparison

Comparison source:

Approved secure file only. No appsettings list/show command was run.

Redacted comparison result:

| Setting | Source contract status |
| --- | --- |
| `FORM_DELIVERY_MODE` | matches Pumpkin API mode |
| `PUMPKIN_API_URL` | matches approved Pumpkin API base URL |
| `PUMPKIN_CONTACT_PUMPKIN_API_WRITE_ROUTE` | matches `/api/forms/ice-rink-rentals/entries` |
| `PUMPKIN_CONTACT_PROTECTED_KEY_ENV_NAME` | matches `PUMPKIN_STATIC_CONTACT_PUMPKIN_API_KEY` |
| `PUMPKIN_STATIC_CONTACT_PUMPKIN_API_KEY_RAW` | present |
| `PUMPKIN_STATIC_CONTACT_PUMPKIN_API_KEY_NORMALIZED` | present |
| `PUMPKIN_STATIC_CONTACT_PUMPKIN_API_KEY_RAW` vs normalized | differs |
| `PUMPKIN_STATIC_CONTACT_PUMPKIN_API_KEY_HAS_WHITESPACE` | true |
| `STATIC_FORM_ALLOWED_SITE_KEYS` | includes `ice-rink-rentals` |
| `STATIC_FORM_ALLOWED_ORIGINS` | includes production Ice origins |

Conclusion:

The only approved source-discovered static appsetting repair was rebinding `PUMPKIN_STATIC_CONTACT_PUMPKIN_API_KEY` to the secure normalized value.
