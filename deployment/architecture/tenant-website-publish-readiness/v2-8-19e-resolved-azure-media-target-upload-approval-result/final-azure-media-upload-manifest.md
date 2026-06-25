# Final Azure Media Upload Manifest

Azure upload execution approval is false for every row. This is the final no-write manifest for a future explicit V2.8.19F upload/readback execution approval.

Resolved public base URL:

```text
https://iceskatingmedia.blob.core.windows.net/ice-rink-rentals-media
```

| Asset ID | Canonical blob name | Target public URL | Content type | SHA-256 | Size | Ready | Upload execution approved |
| --- | --- | --- | --- | --- | ---: | --- | --- |
| `home-hero-portable-ice-rink` | `ice-rink-rentals/home/portable-ice-rink-rental-hero.png` | `https://iceskatingmedia.blob.core.windows.net/ice-rink-rentals-media/ice-rink-rentals/home/portable-ice-rink-rental-hero.png` | `image/png` | `324B1B89777D8F9D277F4CEE70390EB0A3F68DD6902457F9F6F19164E1FBB59C` | `3607110` | true | false |
| `home-corporate-rink-event` | `ice-rink-rentals/home/corporate-ice-rink-rental-event.png` | `https://iceskatingmedia.blob.core.windows.net/ice-rink-rentals-media/ice-rink-rentals/home/corporate-ice-rink-rental-event.png` | `image/png` | `18E985CA59BD67B3F1D74A1A3841A273081B8F8A9DDB97D67DC6FF233E559A2D` | `3685341` | true | false |
| `home-holiday-rink` | `ice-rink-rentals/home/holiday-ice-rink-rental.png` | `https://iceskatingmedia.blob.core.windows.net/ice-rink-rentals-media/ice-rink-rentals/home/holiday-ice-rink-rental.png` | `image/png` | `973CE769137773ECB68C439A192AE7BB96F7BE2365A591C651C3FCC746C0F853` | `3866376` | true | false |
| `home-rink-setup` | `ice-rink-rentals/home/ice-rink-rental-setup.png` | `https://iceskatingmedia.blob.core.windows.net/ice-rink-rentals-media/ice-rink-rentals/home/ice-rink-rental-setup.png` | `image/png` | `113D218572E45A8744673E3B86E2EA7D2E75DFACFCD8A0756A767F59C5AD3F40` | `3545952` | true | false |
| `home-winter-fest-rink` | `ice-rink-rentals/home/winter-fest-ice-rink-rentals.png` | `https://iceskatingmedia.blob.core.windows.net/ice-rink-rentals-media/ice-rink-rentals/home/winter-fest-ice-rink-rentals.png` | `image/png` | `324B1B89777D8F9D277F4CEE70390EB0A3F68DD6902457F9F6F19164E1FBB59C` | `3607110` | true | false |
| `site-logo-primary` | `ice-rink-rentals/logos/ice-skating-rink-rentals-logo.png` | `https://iceskatingmedia.blob.core.windows.net/ice-rink-rentals-media/ice-rink-rentals/logos/ice-skating-rink-rentals-logo.png` | `image/png` | `0D1F970F0411E0778405F0A9CCE316F0C7AFFCA36E27576D4EBEF751782F075B` | `1627660` | true | false |
| `partner-ppec-logo` | `ice-rink-rentals/partners/party-pros-east-coast-logo.png` | `https://iceskatingmedia.blob.core.windows.net/ice-rink-rentals-media/ice-rink-rentals/partners/party-pros-east-coast-logo.png` | `image/png` | `51DF67C825CA2F4E59C23057BDCD0543015FE8AE7F2FEBE38F7ADE932CBB9577` | `93480` | true | false |
| `contact-consultation-image` | `ice-rink-rentals/contact/ice-rink-rental-consultation.png` | `https://iceskatingmedia.blob.core.windows.net/ice-rink-rentals-media/ice-rink-rentals/contact/ice-rink-rental-consultation.png` | `image/png` | `324B1B89777D8F9D277F4CEE70390EB0A3F68DD6902457F9F6F19164E1FBB59C` | `3607110` | false | false |
| `contact-event-planning-image` | `ice-rink-rentals/contact/event-ice-rink-planning.png` | `https://iceskatingmedia.blob.core.windows.net/ice-rink-rentals-media/ice-rink-rentals/contact/event-ice-rink-planning.png` | `image/png` | `18E985CA59BD67B3F1D74A1A3841A273081B8F8A9DDB97D67DC6FF233E559A2D` | `3685341` | false | false |
| `contact-installation-image` | `ice-rink-rentals/contact/ice-rink-installation-preview.png` | `https://iceskatingmedia.blob.core.windows.net/ice-rink-rentals-media/ice-rink-rentals/contact/ice-rink-installation-preview.png` | `image/png` | `113D218572E45A8744673E3B86E2EA7D2E75DFACFCD8A0756A767F59C5AD3F40` | `3545952` | false | false |
| `service-area-portable-rink` | `ice-rink-rentals/service-areas/portable-ice-rink-service-area.png` | `https://iceskatingmedia.blob.core.windows.net/ice-rink-rentals-media/ice-rink-rentals/service-areas/portable-ice-rink-service-area.png` | `image/png` | `324B1B89777D8F9D277F4CEE70390EB0A3F68DD6902457F9F6F19164E1FBB59C` | `3607110` | true | false |

## Upload Inputs

All upload inputs remain outside the repo under:

```text
C:\Users\User\Desktop\PumpkinCMS\ice-site-recovery-intake\azure-upload-staging\v2-8-19b
```

Future upload execution must consume only rows with `Ready: true` unless owner approval changes.
