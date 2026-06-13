# Contact Form Live Payload Result

Result: passed.

The live payload was built from:

- `PUMPKIN_LIVE_CONTACT_TEST_NAME`
- `PUMPKIN_LIVE_CONTACT_TEST_EMAIL`
- `PUMPKIN_LIVE_CONTACT_TEST_MESSAGE`

Raw env values were not printed or stored in this result package.

Safe shape evidence:

| Check | Result |
| --- | --- |
| Name present | `true` |
| Email present | `true` |
| Message present | `true` |
| Name length | `34` |
| Email length | `50` |
| Message length | `93` |
| Email shape valid | `true` |
| Email domain class | `reserved-synthetic-domain` |
| Name synthetic marker | `true` |
| Email synthetic marker | `true` |
| Message synthetic marker | `true` |
| Secret-like text detected | `false` |
| Phone-like text in env fields | `false` |
| Street-address-like text in env fields | `false` |

Payload contract validation passed with no errors or warnings.

| Field | Value |
| --- | --- |
| Site | `ice-rink-rentals` |
| Form id | `default-quote-request` |
| Form key | `default-quote-request` |
| Form type | `quote-request` |
| Page slug | `contact` |
| Domain routing key | `ICE_RINK_RENTALS_STATIC_CONTACT_ENDPOINT` |
| Recipient group | `ICE_RINK_RENTALS_LEAD_RECIPIENT` |
| Routing mode | `manual_review_then_provider_match` |

