# MediaAsset And Blob Readback

MediaAsset readback:

- Source-supported live auth was not available in OSB without introducing secret handling.
- OSB carried forward approved V2.8.61ODR/V2.8.61OF evidence that Party Pros has 627 MediaAsset records.
- The outside-repo V2.8.61OF backup summary reads back 627 MediaAssets and 627 downloaded media blobs.

Blob readback:

- Storage account: `iceskatingmedia`
- Container: `party-pros-philadelphia-media`
- Prefix: `party-pros-philadelphia/`
- Prior accepted blob count: 627
- Fresh representative anonymous HEAD checks: 6/6 passed.

Representative URLs checked:

| Asset | Status | Content type |
| --- | ---: | --- |
| `logo-white.png` | 200 | `image/png` |
| `Arcade-Game-Rentals-Home-Slider.webp` | 200 | `image/webp` |
| `MOON-BOUNCE-COMBO-ATLANTIS.jpg` | 200 | `image/jpeg` |
| `photo-booth-hero.webp` | 200 | `image/webp` |
| `blog/main-line-party-rentals-guide/01-hero.webp` | 200 | `image/webp` |
| `blog/center-city-philadelphia-event-rentals-guide/01-hero.webp` | 200 | `image/webp` |

No storage keys, listKeys, or SAS were used.
