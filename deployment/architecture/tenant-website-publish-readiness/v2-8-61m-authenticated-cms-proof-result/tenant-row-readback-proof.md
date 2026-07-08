# Tenant Row Readback Proof

Status: passed.

Readback approach:

- Used source-supported authenticated routes.
- Selected preferred non-Airstrip tenant `ice-rink-rentals`.
- Recorded counts/status only.
- Did not copy full tenant payloads.

Results:

| Check | Result |
| --- | --- |
| Accessible tenant list status | 200 |
| Accessible tenant count | 2 |
| Preferred Ice tenant present | yes |
| Non-Airstrip tenant selected | yes |
| Tenant row route status | 200 |
| Tenant row count | 1 |
| Airstrip-specific tenant read | not performed |

This closes the V2.8.61L gap for source-supported authenticated tenant row/count readback for the Ice tenant.
