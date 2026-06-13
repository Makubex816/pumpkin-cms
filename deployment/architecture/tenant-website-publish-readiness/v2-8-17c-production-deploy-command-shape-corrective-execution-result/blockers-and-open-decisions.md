# Blockers And Open Decisions

## Active Blocker

Production release remains blocked by `production_deployment_failed_command_shape`.

The V2.8.17C command fixed the dry-run/close-action problem, but the deployment client rejected the artifact-root working-directory shape:

```text
Current directory cannot be identical to or contained within artifact folders.
```

## Open Decisions

- Whether V2.8.17D should execute from the sanitized app root while deploying the `out` folder, so the current directory is not identical to the artifact folder.
- Whether the next command should include explicit `--app-location` / `--output-location` values or use the SWA CLI positional output folder from a parent working directory.
- Whether to keep verbose output enabled with runtime redaction, or use non-verbose output now that the command-shape failure is understood.

No additional deployment attempt is authorized by V2.8.17C.

