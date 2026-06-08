# Validator Integration

The builder integrates with the existing local/offline validator at:

```text
deployment/architecture/multi-tenant-onboarding-system/validator-implementation/
```

The integration imports `validatePackage` from `../validator-implementation/src/index.mjs` and runs it in-process after generation when either `--validate` or `--support-packet` is supplied.

## Behavior

- `--validate` writes validator reports into the generated package folder.
- `--support-packet` implies `--validate`.
- The generated package folder is used as both the package path and report output directory.
- If the validator returns `failed`, the builder exits with status code `1`.
- If the validator passes, the builder exits with status code `0`.
- Phase 2B-2 also writes `BUILDER_PACKAGE_SUMMARY.md` and scans support packet outputs for raw-answer references and secret-like values.

## Report Files

Default validator output includes:

- `validation-report.json`
- `VALIDATION_REPORT.md`

Support packet output adds:

- `support-packet.json`
- `OPERATOR_HANDOFF.md`
- `NON_TECHNICAL_SUMMARY.md`
- `NEXT_ACTIONS.md`
- `PACKAGE_FILE_INVENTORY.md`
- `BUILDER_PACKAGE_SUMMARY.md`

## Boundary

The validator integration remains local only. It does not perform CMS writes, MediaAsset writes, Azure changes, Cloudflare changes, DNS changes, deployment, email, Search Console actions, indexing requests, external HTTP checks, protected config reads, or Roller work.
