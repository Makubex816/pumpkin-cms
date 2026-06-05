# Frontend Payload Compatibility

## Frontend Source

`packages/pumpkin-block-views/src/views/FormBlockView.tsx` sends:

- `staticEndpointRef`
- `leadRecipientRef`

`apps/ice-rink-web/src/components/PageRenderer.tsx` forwards the payload unchanged to the configured static endpoint in static mode.

The Ice snapshot form blocks use:

| Page | Form key | Static endpoint ref | Lead recipient ref |
| --- | --- | --- | --- |
| `home` | `default-quote-request` | `ICE_RINK_RENTALS_STATIC_CONTACT_ENDPOINT` | `ICE_RINK_RENTALS_LEAD_RECIPIENT` |
| `contact` | `default-quote-request` | `ICE_RINK_RENTALS_STATIC_CONTACT_ENDPOINT` | `ICE_RINK_RENTALS_LEAD_RECIPIENT` |

The frontend does not currently send `domainRoutingKey` or `recipientGroup`.

## Compatibility Result

The endpoint package now accepts:

```json
{
  "staticEndpointRef": "ICE_RINK_RENTALS_STATIC_CONTACT_ENDPOINT",
  "leadRecipientRef": "ICE_RINK_RENTALS_LEAD_RECIPIENT"
}
```

and maps that to:

```json
{
  "domainRoutingKey": "ICE_RINK_RENTALS_STATIC_CONTACT_ENDPOINT",
  "recipientGroup": "ICE_RINK_RENTALS_LEAD_RECIPIENT"
}
```

Legacy payloads using `domainRoutingKey` and `recipientGroup` still work.

