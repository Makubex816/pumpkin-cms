# Rollback Notes

Generated: 2026-06-06

## Current Risk

No static artifacts were deployed, no DNS changed, and no production traffic was moved. The created resource is isolated staging infrastructure only.

## If Resource Creation Must Be Reversed Later

Rollback would require a separate explicit approval to delete or disable:

```text
resource group: rg-ice-static-staging
Static Web App: swa-ice-static-staging
```

Do not delete the resource group or Static Web App without a separate approval because that is an Azure resource mutation.

## If A Future Staging Deployment Fails

For a future approved staging deployment failure:

- stop sharing the default hostname
- record the default hostname, artifact root, commit SHA, deployment time, and smoke-test failures
- redeploy a prior known-good staging artifact only if one exists and deployment approval allows it
- leave production DNS and Cloudflare untouched
- do not change CMS, MediaAsset, Function settings, email, Microsoft 365, or Roller state without separate approval
