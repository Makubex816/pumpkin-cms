# Route Classification Proof

Status: passed.

Route classifications: 27.

Breakdown:

| Classification | Count |
| --- | ---: |
| `compiled_page` | 4 |
| `dynamic_route` | 1 |
| `runtime_route` | 18 |
| `owner_review_required` | 2 |
| `legal_static_route` | 2 |

All 25 discovered analyzer routes were preserved. The compiler also synthesized `/contact` and `/service-areas` because the V1 full-template validator requires those baseline pages and routes.

Critical Airstrip routes included:

- `/`
- `/request-booking`
- `/packages`
- `/airstrip-the-club`

Dynamic route visibility remains preserved through `conversion/route-classification.json`.
