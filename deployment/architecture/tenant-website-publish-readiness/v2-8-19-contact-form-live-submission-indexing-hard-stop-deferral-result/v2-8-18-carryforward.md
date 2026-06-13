# V2.8.18 Carryforward

Result: passed.

V2.8.18 classified the production static release as `v2_8_production_static_release_verified`.

Carried forward:

- Production target: `swa-ice-static-staging`
- Resource group: `rg-ice-static-staging`
- Production domains: `iceskatingrinkrentals.com`, `www.iceskatingrinkrentals.com`
- Deployment id: `96fd744f-5589-4ac3-bebb-cfa99048dc0e`
- Artifact run: `sanitized_20260613174033`
- Artifact aggregate SHA-256: `506c6b4c99bcabed162466c79b299f900c6070855b90cd6f38ffae37fceff899`
- V2.8.18 route checks: six `200 OK`
- V2.8.18 validation stack: passed
- V2.8.18 remaining gates: owner business/content acknowledgement, contact-form live submission, and Search Console/indexing

No Azure metadata was re-queried in V2.8.19. The production target confirmation is carried forward from V2.8.18 and supported by the V2.8.19 bounded production route recheck.

