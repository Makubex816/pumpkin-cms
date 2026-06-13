# Failure Forensics Result

Status: complete.

The V2.8.17 deployment failed with generic SWA CLI exit code `1`. The V2.8.17 log also included a legacy `routes.json` warning from unrelated generated `.tmp` backup evidence.

V2.8.17A tested the corrected command shape from the artifact root, with dry-run enabled:

```text
npx --yes @azure/static-web-apps-cli@2.0.9 deploy . --env production --dry-run --swa-config-location .
```

Dry-run result:

- no deployment occurred;
- the legacy `routes.json` warning was not reproduced;
- SWA CLI version was `2.0.9`;
- dry-run emitted DeploymentId `fd39c49d-cdf2-42ee-a75a-ddb5be20108b`;
- the deployment client reported `deployment_token provided was invalid`;
- the deployment client still reported exit code `1` internally.

Conclusion: the V2.8.17 failure is classified as deployment auth/token validity, not static artifact shape, production target selection, DNS, custom-domain configuration, indexing, or production route behavior.
