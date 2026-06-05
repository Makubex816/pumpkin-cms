# Approval Required Before Deployment

Generated: 2026-06-05

This preflight does not authorize execution.

## Separate Approval Required Before

- creating Azure resources
- creating or selecting an Azure Function App
- creating a Function scaffold
- deploying endpoint code
- setting Function App settings
- reading or using protected config
- setting frontend/static build endpoint variables
- setting `STATIC_FORM_ENDPOINT_VERIFIED=true`
- sending any email
- changing Microsoft 365 settings
- changing Cloudflare or DNS
- writing CMS records
- writing MediaAsset records
- deploying static output
- touching Roller

## Deployment Approval Should Specify

- target environment: staging or production
- Azure resource group or approved deployment resource
- Function App name
- selected route: `/api/static-contact` or `/api/contact`
- allowed origins
- app settings source and secret handling
- forward mode: `dry-run` or `pumpkin-api`
- approved test payload policy
- whether backend `FormEntry` persistence verification is approved
- whether email remains disabled
- rollback owner and rollback trigger

## Current Readiness

Endpoint deployment readiness remains pending explicit approval.

Contact form production readiness remains `no`.

Static output quality gates remain `no`.
