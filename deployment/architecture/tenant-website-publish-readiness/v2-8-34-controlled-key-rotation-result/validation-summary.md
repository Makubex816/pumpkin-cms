# Validation Summary

Validation status: passed with blocked-rotation outcome.

Validation results:

- Owner hard-copy file exists outside repo: passed.
- Owner hard-copy SHA-256 file exists outside repo: passed.
- Owner hard-copy path is outside `C:\Users\User\Desktop\PumpkinCMS\pumpkin-cms`: passed.
- V2.8.34 secure working files removed: passed.
- V2.8.34 hash helper removed: passed.
- No V2.8.34 secure working files staged: passed.
- Outside-repo hard-copy file staged: not staged.
- New JSON parse: passed.
- `node --check` for changed JS/MJS: passed.
- Scoped `git diff --check`: passed.
- Trailing whitespace scan: passed.
- Secret-like scan of repo result files: passed.
- Mutation/POST/deploy command-shaped scan of repo result files: passed.
- Protected-path staged guard: passed.
- No deploy occurred: passed.
- No DNS/indexing occurred: passed.
- Isolated verification POST count: 1.
- Production verification POST count: 0.
- Clipboard clear attempted: passed.
- Selected secret env vars cleared: passed.
- No files staged: passed.

The phase did not meet full rotation acceptance because isolated verification returned HTTP 400 and rollback was required. Production remained untouched.
