# Ice Production MediaAsset URL Update Result

Date: 2026-06-05

Primary site: IceSkatingRinkRentals.com

Paused site: RollerRinkRentals.com

## Scope

Approved action:

- update only the 9 approved Ice MediaAsset records from local media URLs to validated `media.iceskatingrinkrentals.com` production URLs
- rerun Ice static export and validators
- update reports/docs

No page/body CMS edits, page metadata edits, theme edits, navigation edits, form edits, Cloudflare changes, Azure changes, deployments, email/Microsoft 365 work, raw image staging, generated static artifact staging, or Roller work were approved or performed.

## Result Summary

MediaAsset production URL updates completed for the 9 approved Ice records.

```text
Admin auth probe: HTTP 200 valid
pre-write public URL validation: 9/9 passed
pre-write MediaAsset readback: 9/9 readable, tenant/site matched
PATCH requests sent: 9
MediaAsset records updated: 9/9
non-target MediaAsset IDs changed: 0
post-write MediaAsset readback: 9/9 expected production URLs
local /media URL fields remaining in updated MediaAsset URL fields: 0
```

The 9 records still have lifecycle `status: draft`; that status was not changed because this approval covered production media URL/storage fields only.

## Later Active Page Body Media Repair Status

On 2026-06-05, a later separately approved run repaired only active Ice root `ContentData` and root `media` URL fields:

```text
active page body/media fields repaired: 132
active ContentData/media root local media URLs remaining: 0
rendered local /media img tags after export: 0
MediaAsset writes in later run: 0
```

Full media production readiness is still `no` because exported static output includes serialized `revision.latestSnapshot` rollback payloads with pre-repair local URLs. The static form endpoint also remains missing/unverified.

## Static Export And Validators

`npm run export:static:ice:cms` exited `0`.

Static route output remained scoped to:

```text
/
/contact
/service-areas
```

Preview/obsolete deployable route paths checked:

```text
/draft-preview: absent
/ice-rink-rentals: absent
/events-holiday-activations: absent
```

Validator result:

- `npm run validate:snapshot:ice`: exit `0`
- strict static output validator: exit `1`
- strict staging package validator: exit `1`

The strict validators initially failed on active page body/media local URLs plus the missing/unverified static form endpoint. After the later active page body/media repair, active rendered image tags are clean, but validators still fail on local URLs serialized from `revision.latestSnapshot` rollback payloads plus the form endpoint blockers.

## Files

- `MEDIAASSET_UPDATE_SCOPE.md`
- `PRE_WRITE_PUBLIC_URL_VALIDATION.md`
- `PRE_WRITE_MEDIAASSET_READBACK.md`
- `MEDIAASSET_UPDATE_RESULT.md`
- `POST_WRITE_MEDIAASSET_READBACK.md`
- `STATIC_EXPORT_RESULT.md`
- `VALIDATOR_RESULT.md`
- `REMAINING_MEDIA_BLOCKERS.md`
- `NEXT_FORM_ENDPOINT_APPROVAL_REQUIRED.md`
- `ROLLBACK_NOTES.md`
- `manifest.json`
