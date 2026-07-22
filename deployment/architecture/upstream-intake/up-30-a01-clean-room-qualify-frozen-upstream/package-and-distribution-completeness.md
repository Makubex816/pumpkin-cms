
# Package and distribution completeness

Disposition: `FAILED_PACKAGE_COMPLETENESS`

Package completeness table:

| Directory | Name | Lockfile | README | LICENSE | NOTICE | dist |
|---|---|---:|---:|---:|---:|---:|
| `apps/starter-app` | pumpkin-starter-app | false | true | false | false | false |
| `packages/pumpkin-block-views` | pumpkin-block-views | false | true | true | true | false |
| `packages/pumpkin-ts-models` | pumpkin-ts-models | true | true | true | true | true |

Distribution readiness is incomplete. `pumpkin-ts-models` can be installed and built from its committed lockfile, but `pumpkin-block-views` and `apps/starter-app` do not provide adjacent lockfiles and cannot complete locked restore/build proof.
