# Ice Phase 8C.12 Final Import Prep

This folder is for IceSkatingRinkRentals.com only. RollerRinkRentals.com remains paused.

This package is final import preparation, not a CMS import. No live CMS Page or Theme record has been changed, no static package has been regenerated, and no Azure, Cloudflare, DNS, workflow, or deployment action is included.

## Source

Derived from:

- `content-review/ice-launch-phase8c10-import-candidate/`

Phase 8C.10 source files were not mutated for this phase.

## Pages Included

- Homepage: `/`
- Contact: `/contact`
- Service Areas: `/service-areas`

`/service-areas` remains canonical. `/areas-served` remains only a future alias/redirect candidate.

No targeted city/location page is included. The future route strategy remains `/state-city`, for example `/fl-orlando`, `/ny-new-york`, or `/pa-philadelphia`, after a specific target city/state is approved.

## Current Decision

Ready for human review: yes.

Ready for CMS import: no.

Ready for production/indexing: no.

The package is expected to remain blocked until approved business values, final MediaAsset selections, human approvals, and admin import/export preflight are complete.

## Contract Gates

Before this package can become CMS-ready, run:

```powershell
dotnet run --project tools\dotnet-page-contract\Pumpkin.PageContractTool.csproj -- validate-package --path content-review\ice-launch-phase8c12-final-import-prep
node tools\dotnet-page-contract\validate-contract-alignment.mjs
```

The contact page must keep the visible `contact-quote-form` `formBlock` backed by `default-quote-request`.
