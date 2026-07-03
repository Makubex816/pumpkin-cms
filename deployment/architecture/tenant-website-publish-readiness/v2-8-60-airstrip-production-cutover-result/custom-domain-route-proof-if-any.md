# Custom Domain Route Proof If Any

Result: not run because custom-domain binding was not attempted.

Reason:

- Read-only DNS checks showed both target domains still pointed to Bluehost/parking IP `66.81.203.198`, not the Airstrip App Service IP `20.118.48.17`.
- Required App Service ownership TXT records were absent.
- The approved rule was to avoid forced binding when validation was not ready.

Default-host proof is recorded in `production-default-host-route-proof.md`.
