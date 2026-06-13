# Corrected Production Deployment Result

Result: succeeded.

Exactly one V2.8.17D production deployment attempt was sent from the neutral deployment parent:

```text
npx --yes @azure/static-web-apps-cli@2.0.9 deploy --app-location app --output-location . --app-name "swa-ice-static-staging" --resource-group "rg-ice-static-staging" --env production --api-language none --api-version none --no-use-keychain --verbose=silly
```

| Field | Value |
| --- | --- |
| Attempt count | `1` |
| Exit code | `0` |
| Deployment action observed | `upload` |
| Dry-run observed | `false` |
| Deployment id | `96fd744f-5589-4ac3-bebb-cfa99048dc0e` |
| Project endpoint reported | `https://happy-mud-0b375e20f.7.azurestaticapps.net` |
| Deployment status | `Succeeded` |
| Broad retry | `0` |
| Second corrective retry | `0` |

The V2.8.17C working-directory/artifact-folder failure did not recur.

