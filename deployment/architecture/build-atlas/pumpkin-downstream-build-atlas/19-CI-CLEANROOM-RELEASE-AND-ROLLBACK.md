# CI, Clean-Room Qualification, Release, and Rollback

## Current evidence limitation

No combined status checks or pull-request workflow runs were observed for the new upstream head. The API test project runs its contract tests only when invoked with `--run-tests`. The source is not qualified merely because it was merged.

## Required clean-room work

Discover exact solution/package layout from the frozen source, then at minimum:

```text
dotnet --info
dotnet restore
dotnet build --configuration Release
dotnet run --project apps/pumpkin-api.Tests -- --run-tests

reproducible install for each Node package/app
npm run build
npm run type-check where defined
npm run lint where defined
```

Run from a new clone or detached worktree without reused `bin`, `obj`, `node_modules`, `dist`, `.next`, or deployment output.

## Additional qualification suites

- all-block serialization fixtures;
- CAPTCHA success/failure/replay/expiry/action/hostname/outage;
- page/editor save/reload and ID stability;
- preview no-submit/no-navigation;
- tenant authorization and cross-tenant denial;
- FormEntry exact-one and ambiguous-timeout recovery;
- artifact secret/local-path/protected-file scans;
- dependency/vulnerability report;
- deterministic source and package hashes.

## Release slices

```text
models
→ API/tests
→ shared form widget
→ block migration
→ visual editor
→ role adapters
→ tenant canary
→ broader rollout
```

Each slice needs a rollback commit/artifact and data rollback or forward-repair plan.
