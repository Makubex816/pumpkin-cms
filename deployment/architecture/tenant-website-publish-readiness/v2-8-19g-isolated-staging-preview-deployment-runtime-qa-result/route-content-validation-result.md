# Route Content Validation Result

Result: pass.

Selected artifact:

- `apps/ice-rink-web/.tmp/sanitized-static-build/ice-rink-rentals/sanitized_20260625060958/repo/apps/ice-rink-web/out`

Route validation:

| Route | Output file | Status | Expected recovered content |
| --- | --- | --- | --- |
| `/` | `index.html` | pass | `Portable Ice Skating Rink Rentals for Events`, `Request a Quote`, `contact@iceskatingrinkrentals.com` |
| `/service-areas` | `service-areas/index.html` | pass | `Portable Ice Rink Rental Service Areas`, `Request Rink Availability Review`, `contact@iceskatingrinkrentals.com` |
| `/contact` | `contact/index.html` | pass | `Request an Ice Rink Rental Quote`, `Public contact email: contact@iceskatingrinkrentals.com`, `mailto:contact@iceskatingrinkrentals.com` |

Output media summary:

- `/`: 5 unique Azure media URLs.
- `/service-areas`: 4 unique Azure media URLs.
- `/contact`: 7 unique Azure media URLs.

Conclusion:

The selected sanitized artifact contains the recovered routes and not the older generic seed-page content.
