# Source Media Reference Map Result

Result: integrated.

The source media map lives in:

`apps/ice-rink-web/src/data/ice-rink-media.ts`

It exports:

- `ICE_MEDIA_PUBLIC_BASE_URL`
- `ICE_PUBLIC_CONTACT_EMAIL`
- `ICE_EXISTING_AZURE_MEDIA_ASSETS`
- `ICE_EXISTING_AZURE_MEDIA_URLS`
- `iceMedia()`

Source asset keys:

- `contactPlanningHero`
- `contactQuotePlanning`
- `contactSetupLogistics`
- `corporateEvent`
- `holidayRink`
- `setupLogistics`
- `siteLogo`
- `ppecLogo`
- `winterFest`

Every public media reference uses an existing Azure Blob URL. No repo-local image binary is used as the source of truth.
