# Public Contact API Binding Plan

## Current public contract

Public Ice contact remains same-origin:

```text
https://iceskatingrinkrentals.com/contact
  -> /api/static-contact
```

No public path change is required.

## Static contact binding target

After API host verification, the static contact adapter must bind to:

```text
PUMPKIN_API_URL=https://app-pumpkin-api-prod-eastus-001.azurewebsites.net
PUMPKIN_CONTACT_PUMPKIN_API_WRITE_ROUTE=/api/forms/ice-rink-rentals/entries
```

The adapter then writes to:

```text
POST https://app-pumpkin-api-prod-eastus-001.azurewebsites.net/api/forms/ice-rink-rentals/entries
```

## Binding order

1. Do not change production SWA.
2. Bind isolated SWA managed API first.
3. Set `FORM_DELIVERY_MODE=pumpkin-api` only after API health/provider checks pass.
4. Use protected key selector `PUMPKIN_CONTACT_PROTECTED_KEY_ENV_NAME=PUMPKIN_STATIC_CONTACT_PUMPKIN_API_KEY`.
5. Run isolated health and OPTIONS checks.
6. Run one approved isolated no-PII contact POST.
7. Confirm Admin readback for the returned id.
8. Only then prepare a separate production binding approval.

## Production binding

Production binding should be a separate change with rollback prepared. Production should not receive Pumpkin API mode until isolated write-read proof passes.
