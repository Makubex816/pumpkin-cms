# Route Recovery Manifest

The backup contains 5 route records.

| Route | Page slug | Expected status | Include in sitemap | Status | Recovery action |
| --- | --- | ---: | --- | --- | --- |
| `/` | `home` | 200 | true | `published` | restore as public route |
| `/service-areas` | `service-areas` | 200 | true | `published` | restore as public route |
| `/contact` | `contact` | 200 | true | `published` | restore as public route |
| `/ice-rink-rentals` | `ice-rink-rentals` | 404 | false | `expected-404` | preserve as obsolete route behavior |
| `/events-holiday-activations` | `events-holiday-activations` | 404 | false | `expected-404` | preserve as obsolete route behavior |

Recovery result: the route model is recoverable and should replace the current minimal route assumptions only through a controlled source integration phase.

