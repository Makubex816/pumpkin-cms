# Starter Focused Test Result

- Generic fixture test: passed.
- Vegas preview contract: passed with exact accounting.
- Tenant redirect runtime test: passed from repository root.
- Browser proof harness syntax: passed.
- No-post, redirect, media URL, alias, link, control, and age-gate assertions: passed locally.

One validation invocation ran the redirect test from the starter subdirectory and produced an expected wrong-working-directory `ENOENT`; the required repository-root invocation then passed. No source change was needed for that invocation error.
