# Local Publish Artifact Manifest

## Publish Command

```powershell
dotnet publish apps/pumpkin-api/pumpkin-api.csproj -c Release --no-restore -o .tmp/v2-8-32c/pumpkin-api-publish /p:ExcludeAppSettingsFromPublish=true
```

## Package Command

```powershell
Compress-Archive -Path .tmp/v2-8-32c/pumpkin-api-publish/* -DestinationPath .tmp/v2-8-32c/pumpkin-api.zip -Force
```

## Artifact Summary

| Field | Value |
| --- | --- |
| Publish directory | `.tmp/v2-8-32c/pumpkin-api-publish` |
| Zip artifact | `.tmp/v2-8-32c/pumpkin-api.zip` |
| Manifest | `.tmp/v2-8-32c/publish-manifest.json` |
| File count | `56` |
| Aggregate SHA-256 | `22c6c0132bbee0cea8489ddf4c9553c06812b5a328dc6d3f69fc802e22201783` |
| Zip SHA-256 | `05e9567dd47f7b59288569ea66815dc5059df903481f097e3222f0036ee5b854` |
| Blocked config file count | `0` |

## Config Boundary

The artifact was generated with `/p:ExcludeAppSettingsFromPublish=true`. The manifest check found no `appsettings*.json`, `local.settings*.json`, or `.env*` files in the publish directory.
