# Entry authority and product-source proof

The repository authority head at INT-10 entry is `2044db379a0f531df7f62193a05425f6721af600`, committed as the corrected UP-30 v3.3.0 authority result.

The latest material downstream product-source anchor is `87ba5cd0ec305d30b9345ea95475c1b7fcde1c62`. It is separated from later documentation-only authority commits. The first product-source history entries inspected were:

- 87ba5cd0ec305d30b9345ea95475c1b7fcde1c62`t2026-07-15T21:51:31-04:00`tAdd dependency-aware App Service readiness gate
- 2864c6640bedb76188ca6112f2b4b582a0c23959`t2026-07-15T19:41:39-04:00`tfix(identity): enforce strict Cosmos login deadlines
- ac62862cf7bfbcfa2bd6559712ee22bf1b1601e5`t2026-07-15T19:16:01-04:00`tfix(identity): scope legacy slot diagnostic token parity
- 51039ead6237eb7f6dff8f445edfe7f63baf5e29`t2026-07-15T18:59:26-04:00`tfix(identity): reconcile interrupted login writes safely
- 36407cd3b68274e393833f9dabaf72482af1a3c3`t2026-07-15T18:41:23-04:00`tfeat(admin): add gated identity management console
- b88c7825fbece97480ea334a13db794923e2d95f`t2026-07-15T18:41:17-04:00`tfeat(identity): add production parity management gates
- 7a733d5f2812d8459716f7b9c2e76b5e6a3252b9`t2026-07-15T14:32:24-04:00`tRetry bounded legacy locator lookup on cold workers
- 7f719505611de16031946dbda13520ace65993f7`t2026-07-15T13:30:17-04:00`tBound Cosmos endpoint discovery for slot parity

Working-tree product drift was preserved unstaged before source work. The drift inventory contains 37 source-scope porcelain entries. No INT-10 source mutation has been made at this checkpoint.

Protected dirty product-source scopes include admin, ice-rink-web, and pumpkin-ts-models dist output. INT-10 source allowlists must avoid overwriting those paths unless a later exact reconciliation proves it safe.
