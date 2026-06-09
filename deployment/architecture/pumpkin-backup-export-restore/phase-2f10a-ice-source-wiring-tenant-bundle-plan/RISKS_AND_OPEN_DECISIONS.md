# Risks And Open Decisions

## Risks

| Risk | Impact | Mitigation |
| --- | --- | --- |
| Assuming Azure SQL when Ice uses Cosmos DB | wrong connector and false blocker | provider discovery before export |
| Reading app settings to discover DB source | secret exposure | require presence-only env or approved non-secret discovery |
| Listing blob contents without approval | data exposure | separate blob inventory approval |
| Copying media into Git-visible paths | accidental asset exposure | ignored `.tmp` path guard and Git checks |
| Treating metadata-only media as binary proof | false restore readiness | validator mode must distinguish metadata and copied blobs |
| Mixing public output with CMS source | restore confusion | tenant bundle separates `public/` and `cms-content/` |
| Putting escrow into standard bundle | secret boundary violation | escrow stays separate |
| Using live profiles implicitly | accidental external calls | explicit profile resolver |

## Open Decisions

- Confirm live CMS database provider and resource identity without protected config reads.
- Decide whether Cosmos backup proof can use platform backup evidence or must use logical export.
- Decide whether media binary proof should be local copy or private backup storage copy.
- Decide the retention class for DB/media artifacts.
- Decide whether tenant website bundles are committed as redacted manifests only or generated under ignored output.
- Decide future Admin UI relationship to tenant bundles.

