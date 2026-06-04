# Next User Actions

Generated: 2026-06-04

## Recommended User Steps

1. Install Azure CLI using official Microsoft installation guidance, or use Azure Cloud Shell.
2. Restart the terminal or VS Code after local installation.
3. Verify Azure CLI availability:

```powershell
az --version
```

4. Log in outside this run:

```powershell
az login
```

5. Confirm the intended subscription:

```powershell
az account show --query "{name:name,id:id}" -o json
```

6. Start a new Codex run using `NEXT_READONLY_CHECK_PROMPT.md`.

## Important

Do not create resources, create Blob containers, upload media, change DNS, deploy, update CMS/MediaAsset records, print secrets, print tokens, print connection strings, or touch Roller while preparing the read-only check.

## Next Approval Needed

After Azure CLI is installed and logged in, approve read-only discovery only.

Resource creation and media execution still require later separate approvals.
