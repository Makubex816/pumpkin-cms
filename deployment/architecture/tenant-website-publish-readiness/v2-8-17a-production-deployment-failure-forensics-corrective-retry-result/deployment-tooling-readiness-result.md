# Deployment Tooling Readiness Result

Status: tooling available; auth gate blocked.

Pinned tooling:

```text
npx --yes @azure/static-web-apps-cli@2.0.9
```

Version check:

```text
2.0.9
```

Safe command-shape discovery:

- `deploy --help` confirmed non-deploying argument support, including `--dry-run` and `--swa-config-location`.
- The corrected dry-run was executed from the artifact root with `--swa-config-location .`.
- The corrected command scope removed the unrelated legacy `routes.json` warning seen in V2.8.17.
- The dry-run still failed because the token was rejected as invalid.

The deployment tooling itself is available. The remaining blocker is deployment-token validity for the approved production target.
