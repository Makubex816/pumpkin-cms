# Tenant, Site, and Form ID Alignment

Known V2.8.26 ID:

`ice-rink-rentals-default-quote-request-f9e8a6d2-3f9c-41d2-92e0-39f8ea83dbd5`

Source alignment:

| Layer | Source | Value |
| --- | --- | --- |
| Static compat site config | `validate-static-form-payload.mjs:31-56` | `siteKey: ice-rink-rentals`, `tenantId: ice-rink-rentals`, `defaultFormId: default-quote-request` |
| Static compat allowed endpoint ref | `validate-static-form-payload.mjs:47-51` | `ICE_RINK_RENTALS_STATIC_CONTACT_ENDPOINT` or configured endpoint key |
| Static compat allowed recipient ref | `validate-static-form-payload.mjs:52-55` | `ICE_RINK_RENTALS_LEAD_RECIPIENT`, `local_admin` |
| Form definition | `packages/pumpkin-ts-models/src/forms.ts:211-263` | `formKey: default-quote-request`, static endpoint ref and lead recipient ref align |
| Form block submit payload | `packages/pumpkin-block-views/src/views/FormBlockView.tsx:92-103` | includes `tenantId`, `siteKey`, `formKey`, `staticEndpointRef`, `leadRecipientRef` |
| Pumpkin API guard | `apps/pumpkin-api/Services/FormSubmissionGuard.cs:28-38` | supports `default-quote-request` |
| Admin read path | `apps/pumpkin-api/Program.cs:1194-1224` | tenant-scoped `form-entries` |

Assessment:

No source-level tenant/site/form mismatch explains the missing Admin row. The accepted V2.8.26 response used an ID shape that matches the expected Ice tenant and quote form.

Cleanup note:

`apps/ice-rink-web/src/data/ice-rink-recovered-pages.ts:51-65` includes `formConfig.domainRoutingKey: ICE_RINK_RENTALS_LEAD_RECIPIENT` while the static endpoint key is correctly `ICE_RINK_RENTALS_STATIC_CONTACT_ENDPOINT`. Because the production submission was accepted and the FormBlock payload sends `staticEndpointRef` separately, this does not explain the accepted-but-not-visible result. It is still a metadata cleanup candidate for a later source pass.

