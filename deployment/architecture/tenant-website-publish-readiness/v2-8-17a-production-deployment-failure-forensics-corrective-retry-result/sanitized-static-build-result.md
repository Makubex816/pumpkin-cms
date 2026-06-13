# Sanitized Static Build Result

Status: passed.

Command:

```text
npm run build:static:ice:sanitized
```

Run result:

| Field | Value |
| --- | --- |
| Site | `ice-rink-rentals` |
| Content source | `seed-sites` |
| Run ID | `sanitized_20260613020714` |
| Protected config copied | `false` |
| Dependency mode | `app-node-modules-junction` |
| Static validate step | passed |
| Next build step | passed |
| Static generate step | passed |

Artifact root:

```text
apps/ice-rink-web/.tmp/sanitized-static-build/ice-rink-rentals/sanitized_20260613020714/repo/apps/ice-rink-web/out
```

The build used explicit non-secret static-form environment approval values and did not read `.env.local` or protected config.
