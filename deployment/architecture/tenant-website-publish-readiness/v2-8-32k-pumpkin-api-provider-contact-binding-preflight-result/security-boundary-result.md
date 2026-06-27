# Security Boundary Result

Protected value handling:

- Protected values were checked by presence only.
- The Static Web App tenant key value was passed directly from the operator-provided environment to the exact source-confirmed app setting.
- Secret values were not written to reports, manifests, markdown, JSON evidence, or final output.
- No `.env.local`, appsettings file, local.settings file, Key Vault secret, keys/listKeys output, connection string, or SAS value was read.

Azure boundary:

- Subscription was locked before inspection and mutation.
- Only the selected Static Web App app settings were mutated.
- Pumpkin API Web App app settings were not mutated.
- No app settings were listed or shown.
