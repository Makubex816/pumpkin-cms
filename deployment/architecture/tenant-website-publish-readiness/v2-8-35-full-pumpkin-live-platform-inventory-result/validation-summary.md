# Validation Summary

Validation status: passed.

Validation results:

- V2.8.35 root report exists: passed.
- V2.8.35 result package exists: passed.
- Required result files exist: passed.
- New JSON parse for `result-manifest.json`: passed.
- Node check for changed JS/MJS: no changed JS/MJS in V2.8.35 deliverables.
- Admin type-check: passed with `npm --prefix apps/admin run type-check`.
- Static contact compat tests: passed with `npm --prefix deployment/static-azure/forms/static-form-endpoint-compat test`.
- Pumpkin API build: first normal output build failed because a local `pumpkin-api` process held an output DLL; isolated ignored output build passed with 0 warnings and 0 errors.
- Temporary isolated build output `.tmp/v2-8-35/build`: removed.
- Scoped `git diff --check`: passed.
- Trailing whitespace scan: passed.
- Secret-like scan: no secret values found. Two documentation-only matches referenced token-handling wording and did not include token values.
- Deploy/mutation/POST command-shaped scan: no executable mutation commands found. Documentation-only hard-stop/no-action references were allowed.
- Protected-path staged guard: passed.
- No `.tmp` files staged: passed.
- No outside-repo hard-copy file staged: passed.
- No secret values from owner hard-copy appear in repo result files: passed.
- No deploy occurred: passed.
- No contact POST occurred: passed.
- No Azure/resource/appsetting/DNS/indexing mutation occurred: passed.
- No files staged at end: passed.
