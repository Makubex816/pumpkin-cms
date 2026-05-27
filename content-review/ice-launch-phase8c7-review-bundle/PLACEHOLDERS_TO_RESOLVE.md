# Placeholders To Resolve

These placeholders must be resolved or explicitly blocked before CMS import.

## Contact Details

- `{{PRIMARY_PHONE}}`
  - Confirm public phone display, formatting, and whether phone links are enabled.
- `{{PRIMARY_EMAIL}}`
  - Confirm public-safe email display.
  - Do not place private inboxes, credentials, or provider secrets in public JSON.

## Service-Area Details

- `{{PRIMARY_SERVICE_AREA}}`
  - Confirm approved service-area wording.
  - Do not imply coverage that has not been approved.
- `{{PRIMARY_REGION}}`
  - Confirm approved regional grouping or remove the placeholder.
- `{{TARGET_CITY}}`
  - Confirm only when the first city/location page is approved.
- `{{TARGET_STATE}}`
  - Confirm only when the first city/location page is approved.
- `{{TARGET_REGION}}`
  - Confirm only when the first city/location page is approved.
- `{{TARGET_CITY_SLUG}}`
  - Confirm only when the first city/location route is approved.

## Form And Lead Routing

- `{{STATIC_CONTACT_ENDPOINT_REF}}`
  - Confirm the non-secret static contact endpoint reference.
  - Verify form behavior in a later staging phase before production.
- `{{LEAD_RECIPIENT_REF}}`
  - Confirm the non-secret recipient or lead-routing reference.
  - Do not place email provider keys, SMTP credentials, API tokens, JWTs, or deployment tokens in JSON.

## Image And Media Placeholders

The templates contain empty image URLs and asset IDs that must be resolved through approved MediaAsset records before CMS import or production publishing.

Review these media slots:

- Homepage featured image
- Homepage hero image
- Homepage local/supporting image
- Homepage closing image
- Homepage Open Graph image
- Contact featured image
- Contact hero image
- Contact local/supporting image
- Contact closing image
- Contact Open Graph image
- Service Areas featured image
- Service Areas hero image
- Service Areas local/supporting image
- Service Areas closing image
- Service Areas Open Graph image

For each image, confirm:

- approved asset ID
- public URL
- alt text
- license status
- usage status
- whether the image is decorative
- dimensions and focal point if available

## Final Domain And Canonical Confirmation

Confirm these canonical URLs before CMS import:

- `https://iceskatingrinkrentals.com/`
- `https://iceskatingrinkrentals.com/contact`
- `https://iceskatingrinkrentals.com/service-areas`

Confirm route policy:

- `/service-areas` is canonical.
- `/areas-served` is only a future redirect or alias candidate.
- No city/location route is active yet.
