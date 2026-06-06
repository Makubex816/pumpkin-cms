# CORS Setting Change Result

Generated: 2026-06-06

## Setting Changed

Only this Function App app setting was changed:

```text
STATIC_FORM_ALLOWED_ORIGINS
```

Function App:

```text
func-ice-static-contact-20260605
```

Resource group:

```text
rg-ice-static-form-endpoint
```

## Before

```text
https://iceskatingrinkrentals.com,https://www.iceskatingrinkrentals.com
```

## After

```text
https://iceskatingrinkrentals.com,https://www.iceskatingrinkrentals.com,https://happy-mud-0b375e20f.7.azurestaticapps.net
```

## Readback

Safe readback confirmed:

- `STATIC_FORM_ALLOWED_SITE_KEYS=ice-rink-rentals`
- `STATIC_FORM_ALLOWED_ORIGINS` contains production root, production `www`, and the Azure staging default origin
- `FORM_DELIVERY_MODE=graph`
- wildcard `*` was not used

No Graph credential, API key, connection string, token, or protected config value was printed.

No endpoint redeploy occurred.
