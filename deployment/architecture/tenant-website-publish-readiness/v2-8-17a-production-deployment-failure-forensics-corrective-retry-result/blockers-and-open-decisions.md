# Blockers And Open Decisions

Active blocker:

- `SWA_CLI_DEPLOYMENT_TOKEN` is present, but the deployment client rejects it as invalid during dry-run.

Open operator action:

- Load a valid deployment token for the existing production-domain SWA target `swa-ice-static-staging` into `SWA_CLI_DEPLOYMENT_TOKEN` by an approved secure operator process.

Still closed:

- token listing;
- protected config reads;
- `.env.local` read/print/copy/move/rename/parse/source/modify;
- DNS/custom-domain mutation;
- Search Console/indexing;
- contact-form submission and contact endpoint POST;
- CMS/provider writes;
- Azure infrastructure/configuration mutation;
- app settings mutation;
- RBAC assignment;
- keys/listKeys;
- connection strings;
- SAS;
- broad retry or second corrective retry.

Next decision needed: a separate V2.8.17B approval for deployment auth replacement verification and, only if gates pass, exactly one bounded corrective production retry.
