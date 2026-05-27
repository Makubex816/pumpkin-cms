# Ice Phase 8C.13 Approval Resolution

This folder is for IceSkatingRinkRentals.com only. RollerRinkRentals.com remains paused.

This is an approval-resolution package. It does not import CMS records, update live pages or themes, regenerate static packages, deploy to Azure, change Cloudflare/DNS, create workflows, or create city/location pages.

## Source

Derived from:

- `content-review/ice-launch-phase8c12-final-import-prep/`

Phase 8C.12 source files were not mutated.

## Approved Values Applied

Only safe constants were applied:

- tenantId: `ice-rink-rentals`
- siteKey: `ice-rink-rentals`
- domain: `iceskatingrinkrentals.com`
- canonical service route: `/service-areas`
- lead recipient ref: `ICE_RINK_RENTALS_LEAD_RECIPIENT`
- static contact endpoint ref: `ICE_RINK_RENTALS_STATIC_CONTACT_ENDPOINT`
- default quote form key: `default-quote-request`
- routes: `/`, `/contact`, `/service-areas`

All prompt values marked `TBD` remain unresolved and are not invented.

## Pages Included

- Homepage: `/`
- Contact: `/contact`
- Service Areas: `/service-areas`

`/service-areas` remains canonical. `/areas-served` remains only a future alias/redirect candidate.

No targeted city/location page is included. Future location pages remain `/state-city`, for example `/fl-orlando`, `/ny-new-york`, or `/pa-philadelphia`.

## Current Readiness

Ready for human review: yes.

Ready for CMS import: no.

Ready for staging: no.

Ready for production/indexing: no.

## Contract Gates

Before CMS import can be reconsidered:

```powershell
dotnet run --project tools\dotnet-page-contract\Pumpkin.PageContractTool.csproj -- validate-package --path content-review\ice-launch-phase8c13-approval-resolution
node tools\dotnet-page-contract\validate-contract-alignment.mjs
```

The contact page must preserve the visible `contact-quote-form` `formBlock` backed by `default-quote-request`.
