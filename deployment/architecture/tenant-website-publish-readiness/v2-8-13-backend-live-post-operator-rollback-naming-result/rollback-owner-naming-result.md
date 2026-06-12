# Rollback Owner Naming Result

Status: closed for this gate.

Approved rollback/abort owner label:

```text
PumpkinCMS operator
```

Rollback remains abort-before-deploy for V2.8.13 because no deployment occurred. If a future staging deployment is approved, rollback must be performed only under that future approval and should use the approved previous artifact or no-deploy abort path.

This closure does not authorize destructive rollback deletion, deployment, DNS changes, CMS writes, provider writes, or Azure mutation.

