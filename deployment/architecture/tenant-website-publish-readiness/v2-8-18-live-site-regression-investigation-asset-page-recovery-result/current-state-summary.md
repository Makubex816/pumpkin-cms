# Current State Summary

The live public website concern is a V2.8 tenant website regression/recovery issue.

Current classification:

```text
readonly_live_site_regression_investigation_no_deploy
```

The production-bound Static Web App is `swa-ice-static-staging`, because it has the real custom domains attached. The safe isolated staging target is `swa-ice-static-isolated-staging`, because Azure metadata lists no custom hostnames for it.

The current source and artifact evidence points to a minimal three-route public site:

- `/`
- `/service-areas`
- `/contact`

The discovered local/static sources do not contain the intended older image-heavy content set. No production deploy was performed in V2.8.18.

