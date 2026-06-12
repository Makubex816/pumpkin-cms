# Static Output Final Validation Result

Status: passed with protected-config caveat.

Static build:

```text
npm run build:static:ice
```

Result: passed. Next reported `.env.local` auto-detection. No protected config file was manually opened or printed.

Static generation:

```text
node scripts/static-publish.mjs generate
```

Result: passed after rerun with explicit local static profile variables.

Static output checks:

| Check | Result |
| --- | --- |
| Static publish manifest page count | 3 |
| Static publish manifest pages | `contact`, `home`, `service-areas` |
| Quality warnings | 35, redacted in manifest |
| Output validator | passed, 42 files, 0 errors, 0 warnings |
| Staging package validator | passed, 42 files, 0 errors, 0 warnings |
| Obsolete output directories | absent |
| Excluded draft preview paths | removed by generator |

