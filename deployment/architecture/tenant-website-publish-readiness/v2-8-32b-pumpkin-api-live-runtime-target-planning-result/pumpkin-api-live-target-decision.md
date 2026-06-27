# Pumpkin API Live Target Decision

## Decision

Preferred target: new Azure App Service for Linux hosting the ASP.NET Core Pumpkin API.

## Target values

| Field | Value |
| --- | --- |
| Resource group | `rg-pumpkin-api-prod-eastus` |
| App Service plan | `asp-pumpkin-api-prod-eastus-001` |
| Web App name | `app-pumpkin-api-prod-eastus-001` |
| Region | `eastus` |
| SKU | `S1` minimum |
| Runtime stack | .NET 10 / ASP.NET Core on Linux |
| Initial base URL | `https://app-pumpkin-api-prod-eastus-001.azurewebsites.net` |
| Custom domain | None in first deployment |

## Alternatives rejected for first implementation

| Option | Decision | Reason |
| --- | --- | --- |
| Recover candidate publish-profile host | Reject for first path | Current metadata does not show it as a live Web App; publish profiles may include protected deployment material |
| Function App | Reject for Pumpkin API | Pumpkin API is ASP.NET Core Web SDK; existing Function App is the static contact endpoint |
| Container Apps | Reject for first path | `Microsoft.App` provider is `NotRegistered`; repo has no current container packaging surface |
| Static Web Apps managed API | Reject for Pumpkin API | Current managed API is Node static contact compat; Pumpkin API is separate .NET API |

## Runtime stack caution

The source target framework is `net10.0`. The deployment execution phase must verify the exact Azure App Service runtime stack token for .NET 10 before resource creation. If .NET 10 built-in stack is unavailable, stop and choose between a source retarget plan or a separately approved container packaging plan.

## Health endpoint decision

Canonical health endpoint should be `GET /api/health`, added before deployment. The existing root route can prove process start, but it is not enough for runtime QA because it does not report service status, version, or provider readiness.
