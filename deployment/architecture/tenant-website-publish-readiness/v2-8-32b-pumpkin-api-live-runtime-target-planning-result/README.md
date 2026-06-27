# V2.8.32B Pumpkin API Live Runtime Target Planning Result

This package records the read-only plan for making Pumpkin API live, externally reachable, and bindable by the Admin runtime and the Ice public static contact adapter.

## Status

Planning complete. No deploy or mutation occurred.

## Decision

Use a new Azure App Service for Linux production target for Pumpkin API:

- Resource group: `rg-pumpkin-api-prod-eastus`
- App Service plan: `asp-pumpkin-api-prod-eastus-001`
- Web App: `app-pumpkin-api-prod-eastus-001`
- Region: `eastus`
- Runtime: .NET 10 / ASP.NET Core
- Initial base URL: `https://app-pumpkin-api-prod-eastus-001.azurewebsites.net`

## Why App Service

Pumpkin API is an ASP.NET Core Web SDK app. The repo's own deployment docs discuss Azure App Service. No current Web App exists in Azure metadata, no container packaging surface is present, Container Apps is not registered in the subscription, and the existing Function App is the static contact endpoint rather than the Pumpkin API.

## Boundary

This phase did not deploy, create Azure resources, mutate Azure, list/show/set app settings, read protected config, query secrets, use deployment tokens, generate connection strings/SAS, submit contact forms, write to production APIs, mutate DNS/custom domains, or run arbitrary outbound URL checks.
