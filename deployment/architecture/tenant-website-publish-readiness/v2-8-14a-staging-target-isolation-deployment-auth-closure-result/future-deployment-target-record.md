# Future Deployment Target Record

The exact future deployment target for a scoped Ice staging deployment is:

```text
tenant: ice-rink-rentals
staticWebAppName: swa-ice-static-isolated-staging
resourceGroup: rg-ice-static-staging
defaultHostname: kind-island-0a85a740f.7.azurestaticapps.net
customDomains: []
canonicalRoutes: /, /service-areas, /contact
```

The future deployment phase must deploy only the approved sanitized static artifact to this isolated target, then perform bounded route checks against the Azure default hostname only.

Production domains must not be used for this staging execution.

