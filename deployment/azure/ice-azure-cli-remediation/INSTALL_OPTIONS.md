# Install Options

Generated: 2026-06-04

## Scope

Planning only. Azure CLI was not installed in this run.

## Option A: Official Microsoft Installer Or Docs

Use the official Microsoft Azure CLI installation documentation or installer for Windows.

Recommended user steps:

1. Open the official Microsoft Azure CLI install documentation.
2. Follow the Windows installation path.
3. Restart the terminal or VS Code after installation.
4. Verify availability with:

```powershell
az --version
```

Do not paste credentials, tokens, keys, or connection strings into the terminal.

## Option B: Winget, If Available

If `winget` is available, the user may install Azure CLI using the official Microsoft package.

Future user-run example:

```powershell
winget install Microsoft.AzureCLI
```

After installation, restart the terminal or VS Code and verify:

```powershell
az --version
```

## Option C: Azure Cloud Shell

As an alternative, use Azure Cloud Shell in the Azure Portal. Azure CLI is normally available there without local installation.

If using Cloud Shell, run only the approved read-only discovery commands and do not run resource creation, upload, key listing, deployment, DNS, CMS, or MediaAsset write commands.

## Important Restart Step

After local installation, restart:

- PowerShell terminal
- VS Code terminal
- any Codex terminal/session that needs to see the new PATH

## Current Run Result

No install command was run.
