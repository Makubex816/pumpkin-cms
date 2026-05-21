# Service Schema And Domain Routing

Phase 6R adds non-secret page contract fields for service pages before externally generated production JSON is imported.

## Page Service Schema

Pages can now carry a `serviceSchema` object:

```json
{
  "serviceName": "Portable ice rink rentals",
  "serviceType": "RentalService",
  "serviceCategory": "Event rentals",
  "productsOffered": [],
  "areasServed": [],
  "audience": [],
  "eventTypes": [],
  "schemaOutputMode": "validate_only",
  "publicSchemaEnabled": false,
  "notes": ""
}
```

`productsOffered` records the actual products/services a page claims to offer. Use placeholder-safe or verified values only. Do not invent provider availability.

`areasServed` is the internal field name. Public JSON-LD maps it to Schema.org `areaServed` when `publicSchemaEnabled` is true and the page has enough service fields.

## Products Offered

Each product item supports:

- `name`
- `type`
- `description`
- `url`
- `category`
- `isPrimary`
- `displayOrder`

Future schema output can map these items to `hasOfferCatalog`, `offers`, or `makesOffer`. Phase 6R only prepares the safe data path.

## Areas Served

Each area item supports:

- `name`
- `type`: `Country`, `State`, `City`, `County`, `Metro`, `Region`, `ServiceArea`, or `Custom`
- `stateCode`
- `city`
- `county`
- `metro`
- `country`
- `url`
- `serviceAreaType`
- `confidence`
- `isPrimary`

Location/service-area pages should include at least one area. Non-direct fulfillment should keep public disclosure requirements enabled.

## Domain Routing

Pages can preserve a non-secret `domainRouting` snapshot and `formConfig` can reference routing keys.

Do store:

- public contact email if it is meant to be displayed
- domain
- brand name
- recipient group names
- endpoint keys
- MX/SPF/DKIM/DMARC status labels
- provider status labels

Do not store:

- API keys
- SMTP passwords
- email provider tokens
- connection strings
- private inbox credentials

## Lead Capture Links

`formConfig` now supports:

- `domainRoutingKey`
- `recipientGroup`
- `routingMode`
- `replyToMode`
- `emailSubjectTemplate`
- `staticFormEndpointKey`
- `mailtoFallbackEnabled`

These fields connect public forms to future static form endpoints and lead routing, while Lead Inbox remains the destination for saved `FormEntry` records.

## Static Publishing

Static output remains page-document driven. Phase 6R does not deploy, provision email, or send mail.

When public service schema is enabled, the frontend can emit a Service JSON-LD object that maps:

- `serviceSchema.areasServed` to Schema.org `areaServed`
- `serviceSchema.productsOffered` to `hasOfferCatalog`

Schema output must stay factual. Do not output invented provider claims.
