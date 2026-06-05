# Page Body Media Repair Result

Three `PUT /api/admin/pages/{tenantId}/{slug}` requests were sent:

- `home`
- `contact`
- `service-areas`

The request payloads were cloned from live page readback and changed only exact local media URL string values inside active root `ContentData` and root `media` fields that mapped to the validated production URL map.

## Field Counts

| Page | Fields repaired |
| --- | ---: |
| `home` | 52 |
| `contact` | 50 |
| `service-areas` | 30 |
| total | 132 |

## Exact Field Paths

### home

```text
ContentData.ContentBlocks[0].content.media.publicUrl
ContentData.ContentBlocks[0].content.media.url
ContentData.ContentBlocks[1].content.partner.logoRequirement.publicUrl
ContentData.ContentBlocks[1].content.partner.logoRequirement.url
ContentData.ContentBlocks[1].content.partner.logoMedia.publicUrl
ContentData.ContentBlocks[1].content.partner.logoMedia.url
ContentData.ContentBlocks[2].content.cards[0].media.publicUrl
ContentData.ContentBlocks[2].content.cards[0].media.url
ContentData.ContentBlocks[2].content.cards[1].media.publicUrl
ContentData.ContentBlocks[2].content.cards[1].media.url
ContentData.ContentBlocks[2].content.cards[2].media.publicUrl
ContentData.ContentBlocks[2].content.cards[2].media.url
ContentData.ContentBlocks[5].content.media.publicUrl
ContentData.ContentBlocks[5].content.media.url
ContentData.ContentBlocks[5].content.image.publicUrl
ContentData.ContentBlocks[5].content.image.url
ContentData.ContentBlocks[6].content.media.publicUrl
ContentData.ContentBlocks[6].content.media.url
ContentData.ContentBlocks[6].content.image.publicUrl
ContentData.ContentBlocks[6].content.image.url
ContentData.ContentBlocks[7].content.media.publicUrl
ContentData.ContentBlocks[7].content.media.url
ContentData.ContentBlocks[7].content.image.publicUrl
ContentData.ContentBlocks[7].content.image.url
ContentData.ContentBlocks[9].content.partner.logoRequirement.publicUrl
ContentData.ContentBlocks[9].content.partner.logoRequirement.url
ContentData.ContentBlocks[9].content.partner.logoMedia.publicUrl
ContentData.ContentBlocks[9].content.partner.logoMedia.url
media.featuredImage.publicUrl
media.featuredImage.url
media.heroImage.publicUrl
media.heroImage.url
media.localImage.publicUrl
media.localImage.url
media.closingImage.publicUrl
media.closingImage.url
media.openGraphImage.publicUrl
media.openGraphImage.url
media.logo.publicUrl
media.logo.url
media.setupImage.publicUrl
media.setupImage.url
media.hero.publicUrl
media.hero.url
media.corporate.publicUrl
media.corporate.url
media.holiday.publicUrl
media.holiday.url
media.setup.publicUrl
media.setup.url
media.ppecPartnerLogo.publicUrl
media.ppecPartnerLogo.url
```

### contact

```text
ContentData.ContentBlocks[0].content.mainImage
ContentData.ContentBlocks[0].content.media.publicUrl
ContentData.ContentBlocks[0].content.media.url
ContentData.ContentBlocks[0].content.image
ContentData.ContentBlocks[2].content.media.publicUrl
ContentData.ContentBlocks[2].content.media.url
ContentData.ContentBlocks[2].content.image.publicUrl
ContentData.ContentBlocks[2].content.image.url
ContentData.ContentBlocks[2].content.imageUrl
ContentData.ContentBlocks[6].content.media.publicUrl
ContentData.ContentBlocks[6].content.media.url
ContentData.ContentBlocks[6].content.image.publicUrl
ContentData.ContentBlocks[6].content.image.url
ContentData.ContentBlocks[6].content.imageUrl
ContentData.ContentBlocks[7].content.cards[0].media.publicUrl
ContentData.ContentBlocks[7].content.cards[0].media.url
ContentData.ContentBlocks[7].content.cards[1].media.publicUrl
ContentData.ContentBlocks[7].content.cards[1].media.url
ContentData.ContentBlocks[7].content.cards[2].media.publicUrl
ContentData.ContentBlocks[7].content.cards[2].media.url
ContentData.ContentBlocks[8].content.partner.logoMedia.publicUrl
ContentData.ContentBlocks[8].content.partner.logoMedia.url
ContentData.ContentBlocks[8].content.logoMedia.publicUrl
ContentData.ContentBlocks[8].content.logoMedia.url
media.featuredImage.publicUrl
media.featuredImage.url
media.heroImage.publicUrl
media.heroImage.url
media.localImage.publicUrl
media.localImage.url
media.closingImage.publicUrl
media.closingImage.url
media.openGraphImage.publicUrl
media.openGraphImage.url
media.logo.publicUrl
media.logo.url
media.setupImage.publicUrl
media.setupImage.url
media.ppecPartnerLogo.publicUrl
media.ppecPartnerLogo.url
media.contactHeroImage.publicUrl
media.contactHeroImage.url
media.contactQuotePlanningImage.publicUrl
media.contactQuotePlanningImage.url
media.contactSetupLogisticsImage.publicUrl
media.contactSetupLogisticsImage.url
media.contactOpenGraphImage.publicUrl
media.contactOpenGraphImage.url
media.contactPpecPartnerLogo.publicUrl
media.contactPpecPartnerLogo.url
```

### service-areas

```text
ContentData.ContentBlocks[0].content.media.publicUrl
ContentData.ContentBlocks[0].content.media.url
ContentData.ContentBlocks[4].content.media.publicUrl
ContentData.ContentBlocks[4].content.media.url
ContentData.ContentBlocks[5].content.partner.logoMedia.publicUrl
ContentData.ContentBlocks[5].content.partner.logoMedia.url
ContentData.ContentBlocks[5].content.logoMedia.publicUrl
ContentData.ContentBlocks[5].content.logoMedia.url
ContentData.ContentBlocks[6].content.cards[0].media.publicUrl
ContentData.ContentBlocks[6].content.cards[0].media.url
ContentData.ContentBlocks[6].content.cards[1].media.publicUrl
ContentData.ContentBlocks[6].content.cards[1].media.url
ContentData.ContentBlocks[6].content.cards[2].media.publicUrl
ContentData.ContentBlocks[6].content.cards[2].media.url
media.featuredImage.publicUrl
media.featuredImage.url
media.heroImage.publicUrl
media.heroImage.url
media.localImage.publicUrl
media.localImage.url
media.closingImage.publicUrl
media.closingImage.url
media.openGraphImage.publicUrl
media.openGraphImage.url
media.logo.publicUrl
media.logo.url
media.setupImage.publicUrl
media.setupImage.url
media.ppecPartnerLogo.publicUrl
media.ppecPartnerLogo.url
```

## Not Changed

- no visible text/copy fields
- no headings or CTAs
- no layout, sections, or section ordering
- no forms
- no theme or navigation
- no slugs or routes
- no SEO robots
- no MediaAsset records
- no obsolete pages
- no Roller records

