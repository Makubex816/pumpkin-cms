# Deployment Tooling Readiness Result

Status: passed.

Pinned command family:

```text
npx --yes @azure/static-web-apps-cli@2.0.9
```

Version check returned:

```text
2.0.9
```

The deployment command shape used no token value on the command line:

```text
npx --yes @azure/static-web-apps-cli@2.0.9 deploy "<validated-artifact-root>" --env production
```

