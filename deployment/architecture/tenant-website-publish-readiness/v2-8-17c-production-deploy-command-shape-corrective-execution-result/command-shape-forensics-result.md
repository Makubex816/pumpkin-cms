# Command Shape Forensics Result

Status: failed command shape after one corrected attempt.

V2.8.17C corrected the prior dry-run issue:

| Field | Observed value |
| --- | --- |
| `SWA_CLI_DEPLOY_DRY_RUN` | `false` |
| `DEPLOYMENT_ACTION` | `upload` |
| `DEPLOYMENT_PROVIDER` | `SwaCli` |
| DeploymentId | `b20c5b8a-b569-404d-a5b2-e3e3f0a5a946` |
| StaticSitesClient build | `689a6c1fe8fc32f40348cc41223a7e9d83dd43d2` |

The attempt still failed with:

```text
Current directory cannot be identical to or contained within artifact folders.
```

Interpretation:

- `--dry-run` was not used.
- The client reached upload-mode setup.
- Running `deploy .` after `Push-Location` into the artifact root made the current working directory identical to the artifact folder from the deployment client's perspective.
- The next command-shape correction should separate working directory/repository base from the artifact folder.

Classification: `production_deployment_failed_command_shape`.

