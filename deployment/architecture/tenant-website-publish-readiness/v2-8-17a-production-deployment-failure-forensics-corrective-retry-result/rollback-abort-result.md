# Rollback Abort Result

Status: aborted before corrective deployment.

No V2.8.17A content deployment occurred, so no rollback was executed.

Abort reason:

```text
corrected_dry_run_rejected_deployment_token_as_invalid
```

Rollback state:

- V2.8.17 original failed deployment remains the latest attempted production deployment action in the evidence chain.
- V2.8.17A did not mutate static content.
- No production route verification was run.
- No rollback content deployment was needed or approved.
