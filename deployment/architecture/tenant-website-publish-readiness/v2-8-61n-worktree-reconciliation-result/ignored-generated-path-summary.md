# Ignored Generated Path Summary

Status: completed.

Ignored status entries: 94,565.

Top ignored families:

| Path family | Ignored entries |
| --- | ---: |
| `apps/` | 58,041 |
| `deployment/` | 18,228 |
| `tools/` | 8,321 |
| `packages/` | 6,508 |
| `.tmp/` | 3,467 |

Large local folders:

| Path | Approx size | Classification |
| --- | ---: | --- |
| `.tmp` | 880 MB | protected ignored workspace; do not broad-delete |
| `apps/admin/.next` | 431 MB | ignored build cache |
| `apps/admin/node_modules` | 373 MB | dependency cache |
| `apps/ice-rink-web/node_modules` | 338 MB | dependency cache |
| `apps/pumpkin-api.Tests/bin` | 150 MB | build output |
| `apps/pumpkin-api/bin` | 149 MB | build output |
| `packages/pumpkin-ts-models/node_modules` | 30 MB | dependency cache |
| `apps/pumpkin-api/obj` | 5.5 MB | build output |
| `apps/pumpkin-api.Tests/obj` | 1.5 MB | build output |

Notes:

- `.tmp` is intentionally protected. Do not clean `.tmp` broadly.
- `node_modules`, `.next`, `bin`, and `obj` are safe delete candidates only after owner approval and only through exact paths.
- `packages/pumpkin-ts-models/dist` exists and is small; because dist files are tracked/modified, do not delete until package publishing policy is confirmed.
