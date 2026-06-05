# Handler Mapping Result

Changed files:

```text
deployment/static-azure/forms/static-form-endpoint/contact-handler.mjs
deployment/static-azure/forms/static-form-endpoint/validate-static-form-payload.mjs
```

## Mapping Rules

- `domainRoutingKey` wins when present.
- `staticEndpointRef` maps to `domainRoutingKey` when `domainRoutingKey` is absent.
- `recipientGroup` wins when present.
- `leadRecipientRef` maps to `recipientGroup` when `recipientGroup` is absent.
- missing routing falls back to the configured Ice endpoint key.
- missing recipient falls back to the Ice lead recipient ref.

## Allowed Ice Refs

Allowed routing refs:

- `ICE_RINK_RENTALS_STATIC_CONTACT_ENDPOINT`
- configured `ICE_RINK_RENTALS_STATIC_FORM_ENDPOINT_KEY`, defaulting to `ice-rink-rentals-default`

Allowed recipient refs:

- `ICE_RINK_RENTALS_LEAD_RECIPIENT`
- `local_admin`

Unknown routing/recipient refs are rejected with generic validation messages and are not echoed in responses.

## Metadata Result

The saved `FormEntry` metadata still uses:

- `metadata.staticEndpointRef`
- `metadata.leadRecipientRef`

Those values are now populated from normalized routing fields regardless of whether the browser sent the frontend aliases or the legacy endpoint fields.

