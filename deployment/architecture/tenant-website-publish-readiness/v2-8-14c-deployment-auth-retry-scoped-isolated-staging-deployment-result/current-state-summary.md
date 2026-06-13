# Current State Summary

V2.8.14C completed the scoped isolated staging deployment boundary.

Current classification:

```text
staging_publish_executed_and_verified
```

The isolated non-production Azure Static Web App target is live at:

```text
https://kind-island-0a85a740f.7.azurestaticapps.net
```

The validated artifact deployed in this phase was:

```text
apps/ice-rink-web/.tmp/sanitized-static-build/ice-rink-rentals/sanitized_20260612235412/repo/apps/ice-rink-web/out
```

The artifact has 41 files and aggregate SHA-256:

```text
91b4158db0bfaa97922aaf22b367a2834ca11f7012ffaf6b3152adddb16c2c21
```

Three bounded isolated staging GET checks passed with `200 OK` for `/`, `/service-areas`, and `/contact`.

V2.8 is now ready for post-staging verification/signoff. Production release and public cutover are not approved.
