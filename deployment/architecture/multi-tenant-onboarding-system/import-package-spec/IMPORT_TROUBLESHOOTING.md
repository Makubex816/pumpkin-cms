# Import Troubleshooting

| Problem | Likely cause | Fix |
| --- | --- | --- |
| JSON parse failure | Missing comma or quote | Validate JSON before import. |
| Page route not approved | Page route differs from `routes.json` | Update route or approved list. |
| Media ID missing | Page references unknown media | Add media asset or remove reference. |
| Form ID missing | Page references unknown form | Add form or remove reference. |
| Local media path found | Content copied from local preview | Replace with profile-approved public media URL. |
| Secret scan hit | Credential pasted into package | Remove secret and rotate if exposed. |
| Obsolete page present | Old route was not marked forbidden | Add forbidden route and remove page file. |

