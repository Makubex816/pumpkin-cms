# Sanitized Static Build Result

Status: passed.

Two sanitized builds were run in this phase:

| Run | Classification |
| --- | --- |
| `sanitized_20260613140018` | superseded; initial fresh build |
| `sanitized_20260613140129` | selected final artifact; rebuilt with the approved public static form endpoint environment |

Selected output:

```text
apps/ice-rink-web/.tmp/sanitized-static-build/ice-rink-rentals/sanitized_20260613140129/repo/apps/ice-rink-web/out
```

The sanitized build reported:

- `protectedConfigCopied`: `false`
- `static-validate`: passed
- `next-build`: passed
- `static-generate`: passed

Generated `.tmp` artifacts are not copied into this result package.

