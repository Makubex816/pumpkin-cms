# Working Directory Separation Result

Result: passed.

| Field | Value |
| --- | --- |
| Neutral deployment parent | `C:/Users/User/AppData/Local/Temp/pumpkincms-v2-8-17d-swa-production-deploy` |
| Deploy child folder | `app` |
| Deploy child path | `C:/Users/User/AppData/Local/Temp/pumpkincms-v2-8-17d-swa-production-deploy/app` |
| SWA CLI current directory | Neutral deployment parent |
| `--app-location` | `app` |
| `--output-location` | `.` |
| Parent equals child | `false` |
| Parent contained within child | `false` |
| Child contained within parent | `true` |
| Deployment run from repo root | `false` |
| Deployment run from artifact root | `false` |

The V2.8.17C artifact-root command-shape blocker was removed by copying the validated artifact into the `app` child folder and running SWA CLI from the neutral parent.

