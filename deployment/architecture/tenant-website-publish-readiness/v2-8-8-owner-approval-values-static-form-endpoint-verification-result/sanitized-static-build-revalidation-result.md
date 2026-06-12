# Sanitized Static Build Revalidation Result

Status: passed.

Command:

```text
npm run build:static:ice:sanitized
```

Run:

```text
sanitized_20260612171036
```

Result:

- `ok: true`
- `protectedConfigCopied: false`
- `protectedConfigContentsRead: false`
- `childEnvironmentAllowlistOnly: true`
- static validate: passed
- Next static build: passed
- static generate: passed
- output exists under ignored `.tmp`

The generated `.tmp` output is not intended to be staged.
