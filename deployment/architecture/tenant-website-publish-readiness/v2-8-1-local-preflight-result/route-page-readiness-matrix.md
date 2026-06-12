# Route Page Readiness Matrix

## Ice Current Safe Local Seed-site Source

| Route | Expected for launch | Current local seed status | Publish result |
| --- | --- | --- | --- |
| `/` | yes | `home.json` present | structurally present, still has workflow/static-eligibility warnings |
| `/contact` | yes | `contact.json` present | structurally present, form endpoint gate still closed |
| `/service-areas` | yes | missing from current `seed-sites` | blocker |
| `/ice-rink-rentals` | no | `ice-rink-rentals.json` present | blocker: obsolete route |
| `/events-holiday-activations` | no | `events-holiday-activations.json` present | blocker: obsolete route |
| `/sitemap.xml` | yes | route exists in app | blocked until route set is corrected |
| `/robots.txt` | yes | route exists in app | blocked until route set is corrected |

## Historical CMS-backed Proof

The historical Ice static form production enablement package records a successful CMS-backed export with snapshot slugs `contact`, `home`, and `service-areas`, and artifact routes `/`, `/contact`, and `/service-areas`.

That proof is useful, but it was not refreshed in V2.8.1 because this phase did not read protected config or call live CMS/API services.
