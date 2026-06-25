# Name Collision Analysis

The planned V2.8.19E canonical target names were compared against the existing blob names listed under `ice-rink-rentals/`.

## Planned Canonical Target Names

| Asset ID | Planned blob name | Existing exact collision |
| --- | --- | --- |
| `home-hero-portable-ice-rink` | `ice-rink-rentals/home/portable-ice-rink-rental-hero.png` | false |
| `home-corporate-rink-event` | `ice-rink-rentals/home/corporate-ice-rink-rental-event.png` | false |
| `home-holiday-rink` | `ice-rink-rentals/home/holiday-ice-rink-rental.png` | false |
| `home-rink-setup` | `ice-rink-rentals/home/ice-rink-rental-setup.png` | false |
| `home-winter-fest-rink` | `ice-rink-rentals/home/winter-fest-ice-rink-rentals.png` | false |
| `site-logo-primary` | `ice-rink-rentals/logos/ice-skating-rink-rentals-logo.png` | false |
| `partner-ppec-logo` | `ice-rink-rentals/partners/party-pros-east-coast-logo.png` | false |
| `contact-consultation-image` | `ice-rink-rentals/contact/ice-rink-rental-consultation.png` | false |
| `contact-event-planning-image` | `ice-rink-rentals/contact/event-ice-rink-planning.png` | false |
| `contact-installation-image` | `ice-rink-rentals/contact/ice-rink-installation-preview.png` | false |
| `service-area-portable-rink` | `ice-rink-rentals/service-areas/portable-ice-rink-service-area.png` | false |

## Existing Prefix Observation

The container already has hashed asset-style blobs under:

```text
ice-rink-rentals/assets/
```

Several existing asset names contain the same SHA-256 values or sizes as current recovered rows. That is useful historical context, but it is not an exact target-name collision because V2.8.19E's planned target names are canonical paths under `home/`, `logos/`, `partners/`, `contact/`, and `service-areas/`.

## Result

Exact collisions with planned V2.8.19E canonical blob names: `0`.

Future upload execution should still use fail-if-exists behavior and abort if a blob appears at a planned canonical target path before upload.
