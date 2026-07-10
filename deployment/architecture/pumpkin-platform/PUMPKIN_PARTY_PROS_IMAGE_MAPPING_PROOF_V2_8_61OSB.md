# Party Pros Image Mapping Proof V2.8.61OSB

Party Pros media mapping now uses public blob URLs under:

`https://iceskatingmedia.blob.core.windows.net/party-pros-philadelphia-media/party-pros-philadelphia/assets/img/`

The repair preserves source-relative paths, including nested blog image paths, rather than flattening filenames.

Representative readback passed:

- `logo-white.png`
- `Arcade-Game-Rentals-Home-Slider.webp`
- `MOON-BOUNCE-COMBO-ATLANTIS.jpg`
- `photo-booth-hero.webp`
- `blog/main-line-party-rentals-guide/01-hero.webp`
- `blog/center-city-philadelphia-event-rentals-guide/01-hero.webp`

Rendered custom-domain HTML contained no local file paths, Windows paths, `/public/...` refs, `party-pros-frontend` refs, or tenant package path refs.
