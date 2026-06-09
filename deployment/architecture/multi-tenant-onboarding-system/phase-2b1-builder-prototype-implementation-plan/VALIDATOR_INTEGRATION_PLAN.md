# Validator Integration Plan

## Existing Validator

The future builder should invoke:

```powershell
node ../validator-implementation/src/cli.mjs --package <generated-package> --out <generated-package> --support-packet
```

The exact relative path can change based on implementation location, but the integration must remain local/offline.

## Planned Integration Modes

- `--validate`: run validator after writing generated package files.
- no `--validate`: generate package only, mark status as not validated.
- `--support-packet`: run validator with support packet output; requires `--validate` or implies validation.
- `--json`: request JSON report output.
- `--markdown`: request Markdown report output.

## Status Handling

- Validator exit `0`: builder exits `0` if generation also succeeded.
- Validator exit `1`: builder exits `1` and reports validation blockers.
- Validator exit `2`: builder exits `2` and reports validator runtime/usage problem.

## Report Handling

The builder should surface:

- overall status
- error/warning counts
- top three blockers
- validator report paths
- support packet paths
- local-only boundary confirmation

## No Reimplementation Rule

Builder validation may catch answer-shape mistakes early, but generated package validity belongs to the existing validator. Do not duplicate cross-file, URL safety, SEO, media, form, or secret-pattern validator logic beyond quick pre-generation checks.

## Failed Validation

If validation fails:

- keep generated files local for operator inspection
- write validator reports
- write support packet if requested
- mark package as not import-ready
- avoid any external action suggestion
