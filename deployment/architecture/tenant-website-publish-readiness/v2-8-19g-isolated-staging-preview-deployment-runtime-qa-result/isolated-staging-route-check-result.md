# Isolated Staging Route Check Result

Result: pass.

Checked host:

- `https://kind-island-0a85a740f.7.azurestaticapps.net`

Approved GET checks only:

| Route | Status | Expected content | Elapsed |
| --- | ---: | --- | ---: |
| `/` | 200 | `Portable Ice Skating Rink Rentals for Events`, `contact@iceskatingrinkrentals.com` | 509 ms |
| `/service-areas` | 200 | `Portable Ice Rink Rental Service Areas`, `contact@iceskatingrinkrentals.com` | 122 ms |
| `/contact` | 200 | `Request an Ice Rink Rental Quote`, `mailto:contact@iceskatingrinkrentals.com` | 117 ms |

Runtime output observations:

- `/`: 1 public email occurrence and 35 Azure media base occurrences.
- `/service-areas`: 1 public email occurrence and 26 Azure media base occurrences.
- `/contact`: 6 public email occurrences and 41 Azure media base occurrences.

No production-domain route checks were performed.
