# Linux Runtime Availability Result

Command:

```powershell
az webapp list-runtimes --os linux --output json
```

Required runtime:

| Runtime | Config | Version | Support | End of life |
| --- | --- | --- | --- | --- |
| `.NET` | `DOTNETCORE|10.0` | `10.0 (LTS)` | `Active` | `2028-12-01` |

Result: the planned Linux `.NET 10` runtime was available before any Azure resource creation command was run.

