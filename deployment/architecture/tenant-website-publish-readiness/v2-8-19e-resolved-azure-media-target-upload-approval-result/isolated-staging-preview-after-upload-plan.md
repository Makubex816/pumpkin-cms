# Isolated Staging Preview After Upload Plan

No isolated staging deploy was approved or performed in V2.8.19E.

After a future explicit upload/readback execution succeeds, the next safe preview path should be:

1. Integrate uploaded Azure media URLs into source or tenant content under a separate source integration approval.
2. Replace or override Ice public fallback email references with `contact@iceskatingrinkrentals.com`.
3. Run local build/static validation without protected config.
4. Deploy only to the isolated staging target `swa-ice-static-isolated-staging` if separately approved.
5. Keep `swa-ice-static-staging` blocked because it is production-bound through real custom domains.

V2.8.19E does not authorize any deploy.
