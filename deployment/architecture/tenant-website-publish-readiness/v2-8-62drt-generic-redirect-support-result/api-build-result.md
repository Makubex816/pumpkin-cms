# API Build Result

Final corrected local source build:

`dotnet build apps/pumpkin-api/pumpkin-api.csproj -c Release --no-restore -p:ExcludeAppSettingsFromPublish=true`

| Check | Result |
| --- | ---: |
| Exit code | 0 |
| Build | succeeded |
| Warnings | 0 |
| Errors | 0 |
| Target framework | `net10.0` |

The final build includes the cross-platform internal-path fix. It is newer than the live deployed binary and was not deployed in DRT.
