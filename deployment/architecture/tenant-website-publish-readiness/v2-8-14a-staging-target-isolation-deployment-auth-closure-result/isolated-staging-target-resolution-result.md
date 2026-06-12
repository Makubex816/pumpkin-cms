# Isolated Staging Target Resolution Result

The resolved future scoped staging target is:

```text
swa-ice-static-isolated-staging
rg-ice-static-staging
kind-island-0a85a740f.7.azurestaticapps.net
```

Resolution checks:

- Target name is explicitly non-production.
- Resource group is the existing staging resource group.
- Default hostname is Azure-generated and not a production custom domain.
- Custom domain list is empty.
- Repository URL and branch are not configured.
- No content deployment occurred.

This resolves the target-isolation blocker from V2.8.14.

