# Multi-Tenant Onboarding System

Generated: 2026-06-07

## Scope

This package designs a reusable production-grade onboarding system for Pumpkin CMS tenants and domains. It turns the IceSkatingRinkRentals.com launch path into a repeatable architecture.

This is architecture/design only. It does not implement a wizard, create tenants, mutate CMS records, create infrastructure, deploy, send email, submit Search Console data, request indexing, or touch Roller.

## Package Map

| Folder | Purpose |
| --- | --- |
| `user-walkthrough/` | Plain-language walkthrough for low-skill users. |
| `intake-package/` | Human intake forms and support packet templates. |
| `import-package-spec/` | Import-ready JSON package structure, schemas, and examples. |
| `validator-design/` | Validation pipeline and report model. |
| `plugin-extension-design/` | Safe extension pack architecture. |
| `deployment-profile-registry/` | Reusable production flow profiles. |
| `wizard-design/` | Future Admin UI onboarding wizard design. |
| `cli-design/` | Future CLI wizard and dry-run design. |
| `operator-runbooks/` | Safe operator runbooks for tenant launch work. |
| `roadmap/` | Phase plan from docs to validators to CLI/Admin UI. |

## Core Model

Each tenant moves through intake, import package validation, CMS preview, static/export validation, media readiness, form readiness, staging, production cutover, owner review, and final indexing approval.

External mutations are never implicit. DNS, Cloudflare, Azure, CMS writes, MediaAsset writes, Function settings, deployment, email, Microsoft 365, and Search Console actions require explicit approval for that exact gate.

## Proven Reference Profile

The Ice-proven deployment profile is named `static-azure-cloudflare-worker-graph` and includes:

- Pumpkin CMS
- static Next export
- Azure Static Web Apps
- Azure Blob media
- Cloudflare Worker media delivery
- Microsoft Graph form delivery
- Cloudflare DNS
- Search Console/indexing last

