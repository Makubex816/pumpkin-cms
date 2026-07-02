# Route To Pumpkin Page Map

Normalized package baseline pages:

| Pumpkin page | target path | source evidence | status |
| --- | --- | --- | --- |
| `home` | `/` | `src/app/page.tsx` | Generated |
| `contact` | `/contact` | No direct source route; generated baseline from booking/contact intent | Generated for contract |
| `service-areas` | `/service-areas` | No direct source route; generated baseline from Las Vegas service context | Generated for contract |
| `request-booking` | `/request-booking` | `src/app/request-booking/page.tsx` | Generated extra page |
| `packages` | `/packages` | `src/app/packages/page.tsx` | Generated extra page |

Expected route validation includes 26 GET routes covering baseline routes, booking, package, event, legal, and news routes.

Owner decisions still needed:

- Whether `/contact` should publish as a contact page, reservation page, or redirect to `/request-booking`.
- Whether `/service-areas` should publish as a Las Vegas service-area page, club/about page, or redirect.
- Which extra package/event/legal routes should be included in first live launch.

