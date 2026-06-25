# Production-Bound Deploy Still Blocked

Production-bound deploy remains blocked.

The target `swa-ice-static-staging` is production-bound because real custom domains are attached. V2.8.19E does not approve deploys to that target.

The isolated staging target remains:

```text
swa-ice-static-isolated-staging
```

No isolated staging deploy is approved in this packet either. Upload/readback, source integration, isolated staging preview, owner review, DNS/custom-domain work, Search Console/indexing, and production release remain separate future approval boundaries.
