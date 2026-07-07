# Pumpkin Existing Resource Sandbox Decision V2.8.61J

Decision: local-only proof is safest now.

Future existing non-Airstrip candidates:

1. `app-pumpkin-admin-isolated-centralus-001`
   - Best technical fit for a full Next server starter proof.
   - Requires separate approval because it currently serves isolated Admin UI proof.

2. `swa-ice-static-isolated-staging`
   - Existing isolated SWA proof target.
   - Less suitable for full Next server/API route proof without a static/SWA adapter.

No production, Airstrip, legacy contact, or custom-domain-bound resource should be used for starter sandbox proof.
